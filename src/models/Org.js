import pool from "../config/db.js";

export const Org = {

  findById: async (id) => {
    const {rows} = await pool.query(
      "SELECT * FROM organization WHERE org_id = $1",
      [id]
    );
    return rows[0];
  },

 
  findByName: async (name) => {
    const {rows} = await pool.query(
      "SELECT org_id, org_name, org_email, org_contact FROM organization WHERE org_name = $1",
      [name]
    );
    return rows[0];
  },


  findAll: async () => {
    const {rows} = await pool.query("SELECT * FROM organization");
    return rows;
  },


  create: async ({ org_name, org_contact, org_email }) => {
    const {rows} = await pool.query(
      "INSERT INTO organization (org_name, org_contact, org_email) VALUES ($1, $2, $3) RETURNING org_id",
      [org_name, org_contact, org_email]
    );
    return rows[0].org_id;
  },

  update: async (id, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...Object.values(data), id];

    const {rowCount} = await pool.query(
      `UPDATE organization SET ${setClause} WHERE org_id = $${keys.length + 1}`,
      values
    );
    return rowCount > 0;
  }
};
