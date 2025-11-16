import db from '../db.js';

class Company {
  static async findAll() {
    return await db.db`
      SELECT * FROM companies ORDER BY name
    `;
  }

  static async findById(id) {
    const result = await db.db`
      SELECT * FROM companies WHERE id = ${id}
    `;
    return result[0] || null;
  }

  static async create(data) {
    const { name, logo_base64 } = data;
    const result = await db.db`
      INSERT INTO companies (name, logo_base64)
      VALUES (${name}, ${logo_base64})
      RETURNING *
    `;
    return result[0];
  }

  static async update(id, data) {
    const { name, logo_base64 } = data;
    const result = await db.db`
      UPDATE companies
      SET name = ${name}, logo_base64 = ${logo_base64}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  }

  static async delete(id) {
    const result = await db.db`
      DELETE FROM companies WHERE id = ${id} RETURNING id
    `;
    return result[0] || null;
  }
}

export default Company;

