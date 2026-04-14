import pool from "../config/db.js";

export const Address = {
  
  findByUser: async (userId, orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 AND org_id = $2",
      [userId, orgId]
    );
    return rows;
  },

  
  findByIdUnderOrg: async (id, userId, orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM addresses WHERE address_id = $1 AND user_id = $2 AND org_id = $3",
      [id, userId, orgId]
    );
    return rows[0];
  },

  
  create: async (data, connection = pool) => {
    const {rows} = await connection.query(
      `INSERT INTO addresses (org_id, user_id, label, address_line1, address_line2, city, state, postal_code, country, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING address_id`,
      [
        data.org_id, data.user_id, data.label || 'Home', data.address_line1, 
        data.address_line2 || null, data.city, data.state, data.postal_code, 
        data.country, data.is_default || false
      ]
    );
    return rows[0].address_id;
  },

  
  update: async (id, orgId, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;
    
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...Object.values(data), id, orgId];
    
    const {rowCount} = await pool.query(
      `UPDATE addresses SET ${setClause} WHERE address_id = $${keys.length + 1} AND org_id = $${keys.length + 2}`,
      values
    );
    return rowCount > 0;
  },

  
  delete: async (id, orgId) => {
    const {rowCount} = await pool.query(
      "DELETE FROM addresses WHERE address_id = $1 AND org_id = $2",
      [id, orgId]
    );
    return rowCount > 0;
  },

  
  setDefault: async (id, userId, orgId, connection = pool) => {
    // Unset current default
    await connection.query(
      "UPDATE addresses SET is_default = FALSE WHERE user_id = $1",
      [userId]
    );
    // Set new default
    const {rowCount} = await connection.query(
      "UPDATE addresses SET is_default = TRUE WHERE address_id = $1 AND user_id = $2",
      [id, userId]
    );
    return rowCount > 0;
  }
};
