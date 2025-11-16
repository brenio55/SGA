import db from '../db.js';

class Department {
  static async findAll(companyId = null) {
    if (companyId) {
      return await db.db`
        SELECT * FROM departments 
        WHERE company_id = ${companyId}
        ORDER BY name
      `;
    }
    return await db.db`
      SELECT * FROM departments ORDER BY name
    `;
  }

  static async findById(id) {
    const result = await db.db`
      SELECT * FROM departments WHERE id = ${id}
    `;
    return result[0] || null;
  }

  static async create(data) {
    const { company_id, name, color } = data;
    const result = await db.db`
      INSERT INTO departments (company_id, name, color)
      VALUES (${company_id}, ${name}, ${color})
      RETURNING *
    `;
    return result[0];
  }

  static async update(id, data) {
    const { name, color } = data;
    const result = await db.db`
      UPDATE departments
      SET name = ${name}, color = ${color}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  }

  static async delete(id) {
    const result = await db.db`
      DELETE FROM departments WHERE id = ${id} RETURNING id
    `;
    return result[0] || null;
  }
}

export default Department;

