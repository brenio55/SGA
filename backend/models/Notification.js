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
    // Lógica:
    // - Notificações SEM aceite: quando visualizadas, vão para o histórico (excluídas daqui)
    // - Notificações COM aceite: mesmo visualizadas, permanecem até serem aceitas/rejeitadas
    // - Notificações respondidas (aceitas/rejeitadas) sempre vão para o histórico
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
        AND (
          -- Se requer aceitação, manter mesmo se visualizada
          (n.requires_acceptance = true)
          OR
          -- Se não requer aceitação, excluir se já foi visualizada
          (n.requires_acceptance = false AND nv.id IS NULL)
        )
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
    // Busca todas as notificações que devem aparecer no histórico:
    // 1. Notificações visualizadas SEM aceite (vão para histórico após visualização)
    // 2. Notificações respondidas (aceitas ou rejeitadas) - sempre vão para histórico
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
        AND (
          -- Notificações respondidas (aceitas ou rejeitadas) sempre vão para histórico
          nr.id IS NOT NULL
          OR
          -- Notificações visualizadas SEM aceite também vão para histórico
          (nv.id IS NOT NULL AND n.requires_acceptance = false)
        )
      ORDER BY viewed_at DESC
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

