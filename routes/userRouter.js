import express from 'express';
import userValidator from '../middleware/userMWValidators.js';
import { requireAuth } from '../middleware/authMWPermission.js';
import {
    addNewUserController,
    clearUserDataController,
    deleteUserByIDController,
    getAllUsersController,
    getUserByIDController,
    udpateUserByIDController
} from '../controller/userController.js';

const router = express.Router();

// GET => http://localhost:8000/user/:id
router.get('/:id', getUserByIDController)

// GET => http://localhost:8000/user
// GET => http://localhost:8000/user?limit=10
router.get('/', getAllUsersController);

// POST => http://localhost:8000/user
// router.post('/', userValidator, authPermission, addNewUserController);

// PUT => http://localhost:8000/user
router.put('/:id', requireAuth, udpateUserByIDController);

// DELETE => http://localhost:8000/user
router.delete('/:id', requireAuth, deleteUserByIDController);

// to clear all data
router.delete('/', requireAuth, clearUserDataController)


export default router;
