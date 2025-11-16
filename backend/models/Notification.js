import db from '../db.js';

class Notification {
  static async findAll(companyId = null) {
    if (companyId) {
      return await db.db`
        SELECT n.*, d.name as department_name
        FROM notifications n
        LEFT JOIN departments d ON n.department_id = d.id
        WHERE n.company_id = ${companyId}
        ORDER BY n.created_at DESC
      `;
    }
    return await db.db`
      SELECT n.*, d.name as department_name
      FROM notifications n
      LEFT JOIN departments d ON n.department_id = d.id
      ORDER BY n.created_at DESC
    `;
  }

  static async findById(id) {
    const result = await db.db`
      SELECT n.*, d.name as department_name
      FROM notifications n
      LEFT JOIN departments d ON n.department_id = d.id
      WHERE n.id = ${id}
    `;
    return result[0] || null;
  }

  static async findForUser(userId, companyId) {
    // Busca notificações que o usuário deve receber baseado nos targets
    // EXCLUI notificações já visualizadas, aceitas ou rejeitadas (essas vão apenas para o histórico)
    // Inclui informação sobre se o usuário já respondeu (aceitou/rejeitou)
    return await db.db`
      SELECT DISTINCT 
        n.*, 
        d.name as department_name,
        nr.response_type as user_response,
        CASE 
          WHEN nv.id IS NOT NULL THEN 'read'
          ELSE 'pending'
        END as view_status
      FROM notifications n
      LEFT JOIN departments d ON n.department_id = d.id
      INNER JOIN notification_targets nt ON n.id = nt.notification_id
      LEFT JOIN users u ON (
        (nt.target_type = 'user' AND nt.target_id = u.id) OR
        (nt.target_type = 'department' AND nt.target_id = u.department_id) OR
        (nt.target_type = 'group' AND nt.target_id = u.group_id) OR
        (nt.target_type = 'all' AND n.company_id = u.company_id)
      )
      LEFT JOIN notification_responses nr ON n.id = nr.notification_id AND nr.user_id = ${userId}
      LEFT JOIN notification_views nv ON n.id = nv.notification_id AND nv.user_id = ${userId}
      WHERE u.id = ${userId} 
        AND n.company_id = ${companyId}
        AND nr.id IS NULL  -- Excluir notificações já respondidas (aceitas ou rejeitadas)
        AND nv.id IS NULL  -- Excluir notificações já visualizadas
      ORDER BY n.created_at DESC
    `;
  }

  static async create(data) {
    const { company_id, department_id, title, description, type, requires_acceptance } = data;
    // Converter undefined para null para campos opcionais
    const deptId = department_id !== undefined ? department_id : null;
    const result = await db.db`
      INSERT INTO notifications (company_id, department_id, title, description, type, requires_acceptance)
      VALUES (${company_id}, ${deptId}, ${title}, ${description}, ${type}, ${requires_acceptance})
      RETURNING *
    `;
    return result[0];
  }

  static async update(id, data) {
    const { title, description, type, requires_acceptance } = data;
    const result = await db.db`
      UPDATE notifications
      SET title = ${title}, 
          description = ${description}, 
          type = ${type}, 
          requires_acceptance = ${requires_acceptance},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return result[0] || null;
  }

  static async delete(id) {
    const result = await db.db`
      DELETE FROM notifications WHERE id = ${id} RETURNING id
    `;
    return result[0] || null;
  }

  static async getViewCount(notificationId) {
    const result = await db.db`
      SELECT COUNT(*) as count
      FROM notification_views
      WHERE notification_id = ${notificationId}
    `;
    return parseInt(result[0]?.count || 0);
  }

  static async getViews(notificationId) {
    return await db.db`
      SELECT nv.*, u.full_name, u.role, d.name as department_name, g.name as group_name
      FROM notification_views nv
      JOIN users u ON nv.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE nv.notification_id = ${notificationId}
      ORDER BY nv.viewed_at DESC
    `;
  }

  static async findViewedByUser(userId, companyId) {
    // Busca todas as notificações visualizadas, aceitas ou rejeitadas pelo usuário
    // Usa UNION para pegar notificações que foram visualizadas OU respondidas
    return await db.db`
      SELECT DISTINCT 
        n.*, 
        d.name as department_name,
        nr.response_type as user_response,
        COALESCE(nv.viewed_at, nr.responded_at) as viewed_at,
        nr.responded_at
      FROM notifications n
      LEFT JOIN departments d ON n.department_id = d.id
      INNER JOIN notification_targets nt ON n.id = nt.notification_id
      LEFT JOIN users u ON (
        (nt.target_type = 'user' AND nt.target_id = u.id) OR
        (nt.target_type = 'department' AND nt.target_id = u.department_id) OR
        (nt.target_type = 'group' AND nt.target_id = u.group_id) OR
        (nt.target_type = 'all' AND n.company_id = u.company_id)
      )
      LEFT JOIN notification_views nv ON n.id = nv.notification_id AND nv.user_id = ${userId}
      LEFT JOIN notification_responses nr ON n.id = nr.notification_id AND nr.user_id = ${userId}
      WHERE u.id = ${userId} 
        AND n.company_id = ${companyId}
        AND (nv.id IS NOT NULL OR nr.id IS NOT NULL)  -- Visualizada OU respondida
      ORDER BY COALESCE(nv.viewed_at, nr.responded_at) DESC
    `;
  }

  static async getStatsForUser(userId, companyId) {
    // Retorna estatísticas de notificações pendentes do usuário agrupadas por departamento
    // Apenas notificações que o usuário ainda não visualizou, aceitou ou rejeitou
    return await db.db`
      SELECT 
        COALESCE(d.name, 'Geral') as department_name,
        d.id as department_id,
        d.color as department_color,
        COUNT(*) as count
      FROM notifications n
      LEFT JOIN departments d ON n.department_id = d.id
      INNER JOIN notification_targets nt ON n.id = nt.notification_id
      LEFT JOIN users u ON (
        (nt.target_type = 'user' AND nt.target_id = u.id) OR
        (nt.target_type = 'department' AND nt.target_id = u.department_id) OR
        (nt.target_type = 'group' AND nt.target_id = u.group_id) OR
        (nt.target_type = 'all' AND n.company_id = u.company_id)
      )
      LEFT JOIN notification_views nv ON n.id = nv.notification_id AND nv.user_id = ${userId}
      LEFT JOIN notification_responses nr ON n.id = nr.notification_id AND nr.user_id = ${userId}
      WHERE u.id = ${userId} 
        AND n.company_id = ${companyId}
        AND nr.id IS NULL  -- Excluir notificações já respondidas
        AND nv.id IS NULL  -- Excluir notificações já visualizadas
      GROUP BY d.id, d.name, d.color
      ORDER BY d.name
    `;
  }
}

export default Notification;

