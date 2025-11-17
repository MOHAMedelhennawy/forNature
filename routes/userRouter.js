import express from 'express';
import { requireAuth } from '../middleware/authMWPermission.js';
import {
    addNewUserController,
    deleteUserByIDController,
    getAllUsersController,
    getUserByIDController,
    udpateUserByIDController
} from '../controller/userController.js';
import userValidator from '../validators/userValidator.js';

const router = express.Router();

// GET => http://localhost:8000/user/:id
router.get('/:id', getUserByIDController)

// GET => http://localhost:8000/user
// GET => http://localhost:8000/user?limit=10
router.get('/', getAllUsersController);

// POST => http://localhost:8000/user
router.post('/', userValidator, addNewUserController);

// PUT => http://localhost:8000/user
router.put('/:id', requireAuth, udpateUserByIDController);

// DELETE => http://localhost:8000/user
router.delete('/:id', requireAuth, deleteUserByIDController);

// to clear all data
// router.delete('/', requireAuth, clearUserDataController)


export default router;
