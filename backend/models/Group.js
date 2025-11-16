import db from '../db.js';

class Group {
  static async findAll(departmentId = null) {
    if (departmentId) {
      return await db.db`
        SELECT * FROM groups 
        WHERE department_id = ${departmentId}
        ORDER BY name
      `;
    }
    return await db.db`
      SELECT * FROM groups ORDER BY name
    `;
  }

  static async findById(id) {
    const result = await db.db`
      SELECT * FROM groups WHERE id = ${id}
    `;
    return result[0] || null;
  }

  static async create(data) {
    const { department_id, name, description } = data;
    const result = await db.db`
      INSERT INTO groups (department_id, name, description)
      VALUES (${department_id}, ${name}, ${description})
      RETURNING *
    `;
    return result[0];
  }

  static async update(id, data) {
    const { name, description } = data;
    const result = await db.db`
      UPDATE groups
      SET name = ${name}, description = ${description}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  }

  static async delete(id) {
    const result = await db.db`
      DELETE FROM groups WHERE id = ${id} RETURNING id
    `;
    return result[0] || null;
  }
}

export default Group;

