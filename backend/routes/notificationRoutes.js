import express from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', notificationController.getAllNotifications);
// Rotas específicas devem vir antes das rotas genéricas com :id
router.get('/user/:user_id/company/:company_id', notificationController.getNotificationsForUser);
router.get('/user/:user_id/company/:company_id/stats', notificationController.getNotificationStatsForUser);
router.get('/user/:user_id/company/:company_id/viewed', notificationController.getViewedNotifications);
router.post('/', notificationController.createNotification);

// Visualizações e respostas (antes das rotas com :id)
router.post('/:id/view', notificationController.viewNotification);
router.post('/:id/respond', notificationController.respondToNotification);
router.get('/:id/views', notificationController.getNotificationViews);

// Rotas genéricas com :id devem vir por último
router.get('/:id', notificationController.getNotificationById);
router.put('/:id', notificationController.updateNotification);
router.delete('/:id', notificationController.deleteNotification);

export default router;

