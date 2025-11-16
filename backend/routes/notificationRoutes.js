import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.get('/user/:user_id/company/:company_id', notificationController.getNotificationsForUser);
router.post('/', notificationController.createNotification);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

// Visualizações e respostas
router.post('/:id/view', notificationController.viewNotification);
router.post('/:id/respond', notificationController.respondToNotification);
router.get('/:id/views', notificationController.getNotificationViews);

export default router;

