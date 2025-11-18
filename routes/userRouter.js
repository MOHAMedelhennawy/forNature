import express from 'express';
import { requireAuth } from '../middleware/authMWPermission.js';
import {
    addNewUserController,
    deleteUserByIDController,
    getAllUsersController,
    getUserByIDController,
    updateUserByIDController
} from '../controller/userController.js';
import { validateSchema } from '../middleware/validateSchema.js';
import { SigninSchema, UpdateUserSchema } from '../middleware/schemas/auth.schema.js';

const router = express.Router();

// GET => http://localhost:8000/api/v1/users
// GET => http://localhost:8000/api/v1/users?limit=10
router.get('/', getAllUsersController);

// GET => http://localhost:8000/api/v1/users/:id
router.get('/:id', getUserByIDController);

// POST => http://localhost:8000/api/v1/users
router.post('/', validateSchema(SigninSchema), addNewUserController);

// PUT => http://localhost:8000/api/v1/users/:id
router.put('/:id', requireAuth, validateSchema(UpdateUserSchema), updateUserByIDController);

// DELETE => http://localhost:8000/api/v1/users/:id
router.delete('/:id', requireAuth, deleteUserByIDController);

// to clear all data
// router.delete('/', requireAuth, clearUserDataController)


export default router;
