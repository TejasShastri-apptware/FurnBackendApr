import pool from "../config/db.js";

export const Tag = {
  
  findAllByOrg: async (orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM tags WHERE org_id = $1",
      [orgId]
    );
    return rows;
  },

 
  findAllGlobal: async () => {
    const {rows} = await pool.query("SELECT * FROM tags");
    return rows;
  },

 
  create: async (orgId, { tag_name, tag_type }) => {
    const {rows} = await pool.query(
      "INSERT INTO tags (org_id, tag_name, tag_type) VALUES ($1, $2, $3) RETURNING tag_id",
      [orgId, tag_name, tag_type]
    );
    return rows[0].tag_id;
  },

  update: async (id, orgId, data) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...Object.values(data), id, orgId];

    const {rowCount} = await pool.query(
      `UPDATE tags SET ${setClause} WHERE tag_id = $${keys.length + 1} AND org_id = $${keys.length + 2}`,
      values
    );
    return rowCount > 0;
  },


  delete: async (id, orgId) => {
    const {rowCount} = await pool.query(
      "DELETE FROM tags WHERE tag_id = $1 AND org_id = $2",
      [id, orgId]
    );
    return rowCount > 0;
  }
};
