import db from '../db.js';

class NotificationResponse {
  static async create(notificationId, userId, responseType) {
    const result = await db.db`
      INSERT INTO notification_responses (notification_id, user_id, response_type)
      VALUES (${notificationId}, ${userId}, ${responseType})
      ON CONFLICT (notification_id, user_id) 
      DO UPDATE SET response_type = ${responseType}, responded_at = NOW()
      RETURNING *
    `;
    return result[0];
  }

  static async findByNotification(notificationId) {
    return await db.db`
      SELECT nr.*, u.full_name, u.role, d.name as department_name, g.name as group_name
      FROM notification_responses nr
      JOIN users u ON nr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE nr.notification_id = ${notificationId}
      ORDER BY nr.responded_at DESC
    `;
  }

  static async findByUser(userId) {
    return await db.db`
      SELECT nr.*, n.title, n.type
      FROM notification_responses nr
      JOIN notifications n ON nr.notification_id = n.id
      WHERE nr.user_id = ${userId}
      ORDER BY nr.responded_at DESC
    `;
  }

  static async getUserResponse(notificationId, userId) {
    const result = await db.db`
      SELECT * FROM notification_responses
      WHERE notification_id = ${notificationId} AND user_id = ${userId}
    `;
    return result[0] || null;
  }
}

export default NotificationResponse;

