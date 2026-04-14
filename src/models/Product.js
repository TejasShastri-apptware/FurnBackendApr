import pool from "../config/db.js";

export const Product = {
 
  findAllGlobal: async () => {
    const {rows} = await pool.query(`
      SELECT p.*, c.category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
      ORDER BY p.created_at DESC
    `);
    return rows;
  },

  findById: async (id) => {
    const {rows} = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [id]
    );
    return rows[0];
  },

 
  findByOrg: async (orgId) => {
    const {rows} = await pool.query(`
      SELECT p.*, c.category_name, 
             STRING_AGG(t.tag_name, ',') AS tags,
             STRING_AGG(t.tag_id::text, ',') AS tag_ids
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      LEFT JOIN product_tags pt ON p.product_id = pt.product_id
      LEFT JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.org_id = $1 AND p.is_active = TRUE
      GROUP BY p.product_id, c.category_name
      ORDER BY p.created_at DESC
    `, [orgId]);
    return rows;
  },

  findByIdUnderOrg: async (id, orgId) => {
    const {rows} = await pool.query(
      "SELECT * FROM products WHERE product_id = $1 AND org_id = $2", 
      [id, orgId]
    );
    return rows[0];
  },


  findByTags: async (orgId, tagIds) => {
    const {rows} = await pool.query(
      `
      SELECT p.*, c.category_name, STRING_AGG(t.tag_name, ',') AS tags
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      JOIN product_tags pt ON p.product_id = pt.product_id
      JOIN tags t ON pt.tag_id = t.tag_id
      WHERE p.org_id = $1
        AND p.is_active = TRUE 
        AND pt.tag_id = ANY($2::int[])
      GROUP BY p.product_id, c.category_name
      HAVING COUNT(DISTINCT pt.tag_id) = $3
      ORDER BY p.created_at DESC
      `,
      [orgId, tagIds, tagIds.length]
    );
    return rows;
  },

  search: async (orgId, { keyword, category_id, min_price, max_price }) => {
    let query = "SELECT * FROM products WHERE org_id = $1 AND is_active = TRUE";
    let params = [orgId];
    let count = 2;

    if (keyword) {
      query += ` AND (name ILIKE $${count} OR description ILIKE $${count + 1})`;
      params.push(`%${keyword}%`, `%${keyword}%`);
      count += 2;
    }

    if (category_id) {
      query += ` AND category_id = $${count}`;
      params.push(category_id);
      count++;
    }

    if (min_price) {
      query += ` AND price >= $${count}`;
      params.push(min_price);
      count++;
    }

    if (max_price) {
      query += ` AND price <= $${count}`;
      params.push(max_price);
      count++;
    }

    const {rows} = await pool.query(query, params);
    return rows;
  },

  /**
   * Create a new product
   */
  create: async (data, connection = pool) => {
    const {rows} = await connection.query(
      `INSERT INTO products 
       (org_id, category_id, name, description, price, discount_price, material, color, length, width, height, stock_quantity) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING product_id`,
      [
        data.org_id, data.category_id, data.name, data.description, 
        data.price, data.discount_price, data.material, data.color, 
        data.length, data.width, data.height, data.stock_quantity
      ]
    );
    return rows[0].product_id;
  },

  /**
   * Update product details
   */
  update: async (id, orgId, data, connection = pool) => {
    const keys = Object.keys(data);
    if (keys.length === 0) return false;

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = [...Object.values(data), id, orgId];

    const {rowCount} = await connection.query(
      `UPDATE products SET ${setClause} WHERE product_id = $${keys.length + 1} AND org_id = $${keys.length + 2}`,
      values
    );
    return rowCount > 0;
  },

  /**
   * Soft delete a product
   */
  softDelete: async (id, orgId) => {
    const {rowCount} = await pool.query(
      "UPDATE products SET is_active = FALSE WHERE product_id = $1 AND org_id = $2",
      [id, orgId]
    );
    return rowCount > 0;
  },

  /**
   * Update stock quantity
   */
  updateStock: async (id, orgId, quantity) => {
    const {rowCount} = await pool.query(
      "UPDATE products SET stock_quantity = $1 WHERE product_id = $2 AND org_id = $3", 
      [quantity, id, orgId]
    );
    return rowCount > 0;
  },

  /**
   * Tag Management
   */
  tags: {
    getForProduct: async (productId, orgId) => {
      const {rows} = await pool.query(`
        SELECT t.* 
        FROM tags t
        JOIN product_tags pt ON t.tag_id = pt.tag_id
        JOIN products p ON pt.product_id = p.product_id
        WHERE p.product_id = $1 AND p.org_id = $2
      `, [productId, orgId]);
      return rows;
    },

    add: async (productId, tagId) => {
      await pool.query(
        "INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [productId, tagId]
      );
    },

    remove: async (productId, tagId) => {
      const {rowCount} = await pool.query(
        "DELETE FROM product_tags WHERE product_id = $1 AND tag_id = $2",
        [productId, tagId]
      );
      return rowCount > 0;
    },

    sync: async (productId, tagIds, orgId, connection = pool) => {
      // Clear existing
      await connection.query("DELETE FROM product_tags WHERE product_id = $1", [productId]);

      if (tagIds && tagIds.length > 0) {
        // Verify tags belong to org
        const {rows: validTags} = await connection.query(
          "SELECT tag_id FROM tags WHERE tag_id = ANY($1::int[]) AND org_id = $2",
          [tagIds, orgId]
        );

        if (validTags.length !== tagIds.length) {
          throw new Error("One or more Tag IDs are invalid or belong to another organization");
        }

        for (const tag of validTags) {
          await connection.query(
            "INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)",
            [productId, tag.tag_id]
          );
        }
      }
    }
  },

  /**
   * Image Management
   */
  images: {
    getAll: async (productId) => {
      const {rows} = await pool.query(
        "SELECT * FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, display_order ASC, image_id ASC",
        [productId]
      );
      return rows;
    },

    findById: async (imageId, productId, connection = pool) => {
      const {rows} = await connection.query(
        "SELECT image_id, image_url, is_primary FROM product_images WHERE image_id = $1 AND product_id = $2",
        [imageId, productId]
      );
      return rows[0];
    },

    // Transactional image addition
    add: async (productId, orgId, { image_url, display_order = 0, is_primary = false }, connection = pool) => {
      // Check if this is the first image
      const {rows: existing} = await connection.query(
        "SELECT COUNT(*) AS cnt FROM product_images WHERE product_id = $1",
        [productId]
      );
      const makeItPrimary = is_primary || parseInt(existing[0].cnt) === 0;

      if (makeItPrimary) {
        // Unset existing primaries
        await connection.query(
          "UPDATE product_images SET is_primary = FALSE WHERE product_id = $1",
          [productId]
        );
        // Sync products.image_url
        await connection.query(
          "UPDATE products SET image_url = $1 WHERE product_id = $2 AND org_id = $3",
          [image_url, productId, orgId]
        );
      }

      const {rows} = await connection.query(
        "INSERT INTO product_images (product_id, image_url, display_order, is_primary) VALUES ($1, $2, $3, $4) RETURNING image_id",
        [productId, image_url, display_order, makeItPrimary]
      );
      return rows[0].image_id;
    },

    setPrimary: async (productId, orgId, imageId, connection = pool) => {
      const {rows: imgCheck} = await connection.query(
        "SELECT image_url FROM product_images WHERE image_id = $1 AND product_id = $2",
        [imageId, productId]
      );
      if (imgCheck.length === 0) throw new Error("Image not found");

      await connection.query(
        "UPDATE product_images SET is_primary = FALSE WHERE product_id = $1",
        [productId]
      );

      await connection.query(
        "UPDATE product_images SET is_primary = TRUE WHERE image_id = $1 AND product_id = $2",
        [imageId, productId]
      );

      await connection.query(
        "UPDATE products SET image_url = $1 WHERE product_id = $2 AND org_id = $3",
        [imgCheck[0].image_url, productId, orgId]
      );
    },

    delete: async (productId, orgId, imageId, connection = pool) => {
      const {rows: imgCheck} = await connection.query(
        "SELECT image_id, is_primary FROM product_images WHERE image_id = $1 AND product_id = $2",
        [imageId, productId]
      );
      if (imgCheck.length === 0) throw new Error("Image not found");

      const wasPrimary = imgCheck[0].is_primary;
      await connection.query("DELETE FROM product_images WHERE image_id = $1", [imageId]);

      if (wasPrimary) {
        const {rows: remaining} = await connection.query(
          "SELECT image_id, image_url FROM product_images WHERE product_id = $1 ORDER BY display_order ASC, image_id ASC LIMIT 1",
          [productId]
        );
        if (remaining.length > 0) {
          await connection.query(
            "UPDATE product_images SET is_primary = TRUE WHERE image_id = $1",
            [remaining[0].image_id]
          );
          await connection.query(
            "UPDATE products SET image_url = $1 WHERE product_id = $2 AND org_id = $3",
            [remaining[0].image_url, productId, orgId]
          );
        } else {
          await connection.query(
            "UPDATE products SET image_url = NULL WHERE product_id = $1 AND org_id = $2",
            [productId, orgId]
          );
        }
      }
    }
  }
};
