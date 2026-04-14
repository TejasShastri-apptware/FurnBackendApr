import pool from "../config/db.js";

export const Order = {
  /**
   * Create an order
   */
  create: async (data, connection = pool) => {
    const {rows} = await connection.query(
      `INSERT INTO orders (user_id, org_id, total_amount, payment_id, shipping_address_id, order_status) 
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING order_id`,
      [data.user_id, data.org_id, data.total_amount, data.payment_id, data.shipping_address_id]
    );
    return rows[0].order_id;
  },

  /**
   * Add items to an order
   */
  addItems: async (orderId, items, connection = pool) => {
    for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }
  },

  /**
   * Find orders by user and organization
   */
  findByUser: async (userId, orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 AND org_id = $2 ORDER BY created_at DESC", 
      [userId, orgId]
    );
    return rows;
  },

  /**
   * Find all orders across all organizations
   */
  findAllGlobal: async () => {
    const {rows} = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
    return rows;
  },

  /**
   * Find all orders under an organization
   */
  findAllByOrg: async (orgId) => {
    const {rows} = await pool.query("SELECT * FROM orders WHERE org_id = $1 ORDER BY created_at DESC", [orgId]);
    return rows;
  },

  /**
   * Get detailed order history with snapshots per item
   */
  findDetailedByUser: async (userId, orgId) => {
    const {rows} = await pool.query(
      `SELECT 
          o.order_id, o.user_id, o.total_amount, o.order_status, o.created_at,
          a.address_line1, a.city, a.postal_code, a.country,
          oi.product_id, p.name AS product_name, oi.quantity, oi.unit_price, (oi.unit_price * oi.quantity) AS subtotal
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
       JOIN order_items oi ON o.order_id = oi.order_id
       JOIN products p ON oi.product_id = p.product_id
       WHERE o.user_id = $1 AND o.org_id = $2
       ORDER BY o.created_at DESC`,
      [userId, orgId]
    );
    return rows;
  },

  /**
   * Get basic order details by ID
   */
  findById: async (orderId, orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM orders WHERE order_id = $1 AND org_id = $2", 
      [orderId, orgId]
    );
    return rows[0];
  },

  /**
   * Get snapshotted items for an order
   */
  findItemsByOrderId: async (orderId) => {
    const {rows} = await pool.query(
      `SELECT oi.*, p.name 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    return rows;
  },

  /**
   * Get detailed order by ID (with address snapshot)
   */
  findDetailedById: async (orderId, orgId) => {
    const {rows: orderRows} = await pool.query(
      `SELECT o.*, a.address_line1, a.city, a.postal_code, a.country 
       FROM orders o
       LEFT JOIN addresses a ON o.shipping_address_id = a.address_id
       WHERE o.order_id = $1 AND o.org_id = $2`,
      [orderId, orgId]
    );
    if (orderRows.length === 0) return null;

    const {rows: items} = await pool.query(
      `SELECT oi.product_id, p.name, oi.quantity, oi.unit_price, (oi.unit_price * oi.quantity) AS subtotal
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    return { order: orderRows[0], items };
  },

  /**
   * Update order status with transactional logic
   */
  updateStatus: async (orderId, orgId, status, connection = pool) => {
    const {rows} = await connection.query(
      `SELECT order_id, order_status FROM orders
       WHERE order_id = $1 AND org_id = $2 FOR UPDATE`,
      [orderId, orgId]
    );
    if (rows.length === 0) throw new Error("Order not found.");
    if (rows[0].order_status !== 'pending') throw new Error(`Order is already '${rows[0].order_status}' and cannot be changed.`);

    await connection.query(
      "UPDATE orders SET order_status = $1 WHERE order_id = $2 AND org_id = $3",
      [status, orderId, orgId]
    );

    // If cancelling: return stock
    if (status === 'cancelled') {
      await connection.query(
        `UPDATE products p
         SET stock_quantity = p.stock_quantity + oi.quantity
         FROM order_items oi 
         WHERE p.product_id = oi.product_id
           AND oi.order_id = $1 AND p.org_id = $2`,
        [orderId, orgId]
      );
    }
    return true;
  }
};
