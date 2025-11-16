import db from '../db.js';

class User {
  static async findAll(companyId = null) {
    if (companyId) {
      return await db.db`
        SELECT u.*, d.name as department_name, g.name as group_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN groups g ON u.group_id = g.id
        WHERE u.company_id = ${companyId}
        ORDER BY u.full_name
      `;
    }
    return await db.db`
      SELECT u.*, d.name as department_name, g.name as group_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      ORDER BY u.full_name
    `;
  }

  static async findById(id) {
    const result = await db.db`
      SELECT u.*, d.name as department_name, g.name as group_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = ${id}
    `;
    return result[0] || null;
  }

  static async findByEmail(email) {
    const result = await db.db`
      SELECT u.*, d.name as department_name, g.name as group_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.email = ${email}
    `;
    return result[0] || null;
  }

  static async findByGroup(groupId) {
    return await db.db`
      SELECT u.*, d.name as department_name, g.name as group_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.group_id = ${groupId}
      ORDER BY u.full_name
    `;
  }

  static async create(data) {
    const { company_id, department_id, group_id, full_name, role, email, password, image_base64 } = data;
    
    // Converter undefined para null para campos opcionais
    const deptId = department_id !== undefined ? department_id : null;
    const grpId = group_id !== undefined ? group_id : null;
    const imgBase64 = image_base64 !== undefined ? image_base64 : null;
    
    const result = await db.db`
      INSERT INTO users (company_id, department_id, group_id, full_name, role, email, password, image_base64)
      VALUES (${company_id}, ${deptId}, ${grpId}, ${full_name}, ${role || 'user'}, ${email}, ${password}, ${imgBase64})
      RETURNING id, company_id, department_id, group_id, full_name, role, email, image_base64, created_at, updated_at
    `;
    return result[0];
  }

  static async update(id, data) {
    const { department_id, group_id, full_name, role, email, password, image_base64 } = data;
    
    // Construir objeto de atualização apenas com campos definidos
    const updateData = {};
    if (department_id !== undefined) updateData.department_id = department_id;
    if (group_id !== undefined) updateData.group_id = group_id;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (image_base64 !== undefined) updateData.image_base64 = image_base64;
    
    if (Object.keys(updateData).length === 0) return null;
    
    // Usar template literal do postgres de forma segura
    const fields = Object.keys(updateData);
    const values = fields.map(field => updateData[field]);
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING id, company_id, department_id, group_id, full_name, role, email, image_base64, created_at, updated_at`;
    values.push(id);
    
    const result = await db.db.unsafe(query, values);
    return result[0] || null;
  }

  static async delete(id) {
    const result = await db.db`
      DELETE FROM users WHERE id = ${id} RETURNING id
    `;
    return result[0] || null;
  }
}

export default User;

