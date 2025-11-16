import db from '../db.js';

class NotificationView {
  static async create(notificationId, userId) {
    const result = await db.db`
      INSERT INTO notification_views (notification_id, user_id)
      VALUES (${notificationId}, ${userId})
      ON CONFLICT (notification_id, user_id) DO NOTHING
      RETURNING *
    `;
    return result[0] || null;
  }

  static async findByNotification(notificationId) {
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

  static async findByUser(userId) {
    return await db.db`
      SELECT nv.*, n.title, n.type
      FROM notification_views nv
      JOIN notifications n ON nv.notification_id = n.id
      WHERE nv.user_id = ${userId}
      ORDER BY nv.viewed_at DESC
    `;
  }

  static async getViewsByDepartment(notificationId) {
    return await db.db`
      SELECT 
        d.name as department,
        COUNT(DISTINCT nv.user_id) as users_viewed,
        COUNT(nv.id) as total_views
      FROM notification_views nv
      JOIN users u ON nv.user_id = u.id
      JOIN departments d ON u.department_id = d.id
      WHERE nv.notification_id = ${notificationId}
      GROUP BY d.id, d.name
      ORDER BY d.name
    `;
  }

  static async getViewsByGroup(notificationId) {
    return await db.db`
      SELECT 
        g.name as group_name,
        d.name as department,
        COUNT(DISTINCT nv.user_id) as users_viewed,
        COUNT(nv.id) as total_views
      FROM notification_views nv
      JOIN users u ON nv.user_id = u.id
      JOIN groups g ON u.group_id = g.id
      JOIN departments d ON g.department_id = d.id
      WHERE nv.notification_id = ${notificationId}
      GROUP BY g.id, g.name, d.name
      ORDER BY d.name, g.name
    `;
  }
}

export default NotificationView;

