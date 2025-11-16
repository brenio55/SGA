import Notification from '../models/Notification.js';
import NotificationTarget from '../models/NotificationTarget.js';
import NotificationView from '../models/NotificationView.js';
import NotificationResponse from '../models/NotificationResponse.js';

export const getAllNotifications = async (req, res) => {
  try {
    const { company_id } = req.query;
    const notifications = await Notification.findAll(company_id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    // Buscar targets, views e responses
    const [targets, views, responses] = await Promise.all([
      NotificationTarget.findByNotification(id),
      NotificationView.findByNotification(id),
      NotificationResponse.findByNotification(id)
    ]);

    res.json({
      ...notification,
      targets,
      views,
      view_count: views.length,
      responses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationsForUser = async (req, res) => {
  try {
    const { user_id, company_id } = req.params;
    const notifications = await Notification.findForUser(user_id, company_id);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { company_id, department_id, title, description, type, requires_acceptance, targets } = req.body;

    if (!company_id || !title) {
      return res.status(400).json({ error: 'company_id e title são obrigatórios' });
    }

    // Criar notificação
    const notification = await Notification.create({
      company_id,
      department_id,
      title,
      description,
      type: type || 'normal',
      requires_acceptance: requires_acceptance || false
    });

    // Criar targets se fornecidos
    if (targets && targets.length > 0) {
      const targetsData = targets.map(t => ({
        notification_id: notification.id,
        target_type: t.target_type,
        target_id: t.target_id
      }));
      await NotificationTarget.createMultiple(targetsData);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, requires_acceptance, targets } = req.body;

    const notification = await Notification.update(id, {
      title,
      description,
      type,
      requires_acceptance
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    // Atualizar targets se fornecidos
    if (targets) {
      await NotificationTarget.deleteByNotification(id);
      if (targets.length > 0) {
        const targetsData = targets.map(t => ({
          notification_id: id,
          target_type: t.target_type,
          target_id: t.target_id
        }));
        await NotificationTarget.createMultiple(targetsData);
      }
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Notification.delete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    res.json({ message: 'Notificação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const viewNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id é obrigatório' });
    }

    const view = await NotificationView.create(id, user_id);
    res.json(view || { message: 'Visualização já registrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const respondToNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, response_type } = req.body;

    if (!user_id || !response_type) {
      return res.status(400).json({ error: 'user_id e response_type são obrigatórios' });
    }

    if (!['accepted', 'rejected'].includes(response_type)) {
      return res.status(400).json({ error: 'response_type deve ser "accepted" ou "rejected"' });
    }

    const response = await NotificationResponse.create(id, user_id, response_type);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotificationViews = async (req, res) => {
  try {
    const { id } = req.params;
    const { group_by } = req.query;

    if (group_by === 'department') {
      const views = await NotificationView.getViewsByDepartment(id);
      return res.json(views);
    }

    if (group_by === 'group') {
      const views = await NotificationView.getViewsByGroup(id);
      return res.json(views);
    }

    const views = await NotificationView.findByNotification(id);
    res.json(views);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

