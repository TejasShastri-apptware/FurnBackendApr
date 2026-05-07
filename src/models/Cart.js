import pool from "../config/db.js";

export const Cart = {
  
  getItemsForCheckout: async (userId, orgId, connection = pool) => {
    const {rows} = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock_quantity
       FROM cart_items c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = $1 AND c.org_id = $2 FOR UPDATE`,
      [userId, orgId]
    );
    return rows;
  },

  
  clear: async (userId, orgId, connection = pool) => {
    await connection.query(
      "DELETE FROM cart_items WHERE user_id = $1 AND org_id = $2",
      [userId, orgId]
    );
  },

 
  findAllByUser: async (userId, orgId) => {
    const {rows} = await pool.query(
      `SELECT c.cart_item_id, c.product_id, p.name, p.price, p.image_url, p.stock_quantity, c.quantity, 
              (p.price * c.quantity) AS subtotal
       FROM cart_items c
       JOIN products p ON c.product_id = p.product_id
       WHERE c.user_id = $1 AND c.org_id = $2`,
      [userId, orgId]
    );
    return rows;
  },


  addItem: async (userId, orgId, { product_id, quantity = 1 }) => {
    const {rowCount} = await pool.query(
      `INSERT INTO cart_items (user_id, org_id, product_id, quantity)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, org_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [userId, orgId, product_id, quantity]
    );
    return rowCount > 0;
  },


  updateQuantity: async (cartItemId, userId, orgId, quantity) => {
    const {rowCount} = await pool.query(
      "UPDATE cart_items SET quantity = $1 WHERE cart_item_id = $2 AND user_id = $3 AND org_id = $4",
      [quantity, cartItemId, userId, orgId]
    );
    return rowCount > 0;
  },

 
  removeItem: async (cartItemId, userId, orgId) => {
    const {rowCount} = await pool.query(
      "DELETE FROM cart_items WHERE cart_item_id = $1 AND user_id = $2 AND org_id = $3",
      [cartItemId, userId, orgId]
    );
    return rowCount > 0;
  }
};
