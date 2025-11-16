import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.get('/group/:group_id', userController.getUsersByGroup);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;

