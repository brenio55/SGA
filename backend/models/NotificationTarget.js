import db from '../db.js';

class NotificationTarget {
  static async findByNotification(notificationId) {
    return await db.db`
      SELECT * FROM notification_targets
      WHERE notification_id = ${notificationId}
      ORDER BY created_at
    `;
  }

  static async create(data) {
    const { notification_id, target_type, target_id } = data;
    // Converter undefined para null para target_id (quando target_type é 'all', target_id não é necessário)
    const targetId = target_id !== undefined ? target_id : null;
    const result = await db.db`
      INSERT INTO notification_targets (notification_id, target_type, target_id)
      VALUES (${notification_id}, ${target_type}, ${targetId})
      RETURNING *
    `;
    return result[0];
  }

  static async createMultiple(targets) {
    if (!targets || targets.length === 0) return [];
    
    // Criar múltiplos registros usando Promise.all
    const results = await Promise.all(
      targets.map(target => this.create(target))
    );
    
    return results;
  }

  static async deleteByNotification(notificationId) {
    const result = await db.db`
      DELETE FROM notification_targets 
      WHERE notification_id = ${notificationId}
      RETURNING id
    `;
    return result;
  }
}

export default NotificationTarget;

