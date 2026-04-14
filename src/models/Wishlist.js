import pool from "../config/db.js";

export const Wishlist = {
  findAllByUser: async (userId, orgId) => {
    const {rows} = await pool.query(
      `SELECT w.wishlist_id, w.product_id, p.name, p.price, p.image_url, w.added_at
       FROM wishlists w
       JOIN products p ON w.product_id = p.product_id
       WHERE w.user_id = $1 AND w.org_id = $2`,
      [userId, orgId]
    );
    return rows;
  },

  addItem: async (userId, orgId, productId) => {
    const {rowCount} = await pool.query(
      "INSERT INTO wishlists (user_id, org_id, product_id) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO NOTHING",
      [userId, orgId, productId]
    );
    return rowCount > 0;
  },

  removeItem: async (wishlistId, userId, orgId) => {
    const {rowCount} = await pool.query(
      "DELETE FROM wishlists WHERE wishlist_id = $1 AND user_id = $2 AND org_id = $3",
      [wishlistId, userId, orgId]
    );
    return rowCount > 0;
  },

  checkItemExists: async (userId, orgId, productId) => {
    const {rows} = await pool.query(
      "SELECT wishlist_id FROM wishlists WHERE user_id = $1 AND org_id = $2 AND product_id = $3",
      [userId, orgId, productId]
    );
    return rows.length > 0;
  }
};
