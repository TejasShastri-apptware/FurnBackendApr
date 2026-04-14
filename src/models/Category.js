import pool from "../config/db.js";

export const Category = {
  findByIdUnderOrg: async (id, orgId) => {
    const {rows} = await pool.query(
      "SELECT category_id FROM categories WHERE category_id = $1 AND org_id = $2",
      [id, orgId]
    );
    return rows[0];
  },

  findAllUnderOrg: async (orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM categories WHERE org_id = $1",
      [orgId]
    );
    return rows;
  },

  create: async (orgId, data) => {
    const {rows} = await pool.query(
      "INSERT INTO categories (org_id, category_name, description) VALUES ($1, $2, $3) RETURNING category_id",
      [orgId, data.category_name, data.description]
    );
    return rows[0].category_id;
  },

  update: async (id, orgId, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...Object.values(data), id, orgId];

    const {rowCount} = await pool.query(
      `UPDATE categories SET ${setClause} WHERE category_id = $${keys.length + 1} AND org_id = $${keys.length + 2}`,
      values
    );
    return rowCount > 0;
  },

  delete: async (id, orgId) => {
    const {rowCount} = await pool.query(
      "DELETE FROM categories WHERE category_id = $1 AND org_id = $2",
      [id, orgId]
    );
    return rowCount > 0;
  }
};
