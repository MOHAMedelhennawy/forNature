import express from 'express';
import userValidator from '../middleware/userMWValidators.js';
import authPermission from '../middleware/authMWPermission.js';
import {
    addNewUserHandler,
    clearUserDataHandler,
    deleteUserByIDHandler,
    getAllUsersHandler,
    getUserByIDHandler,
    udpateUserByIDHandler
} from '../handlers/userHandler.js';

const router = express.Router();

// GET => http://localhost:8000/user/:id
router.get('/:id', getUserByIDHandler)

// GET => http://localhost:8000/user
// GET => http://localhost:8000/user?limit=10
router.get('/', getAllUsersHandler);

// POST => http://localhost:8000/user
// router.post('/', userValidator, authPermission, addNewUserHandler);

// PUT => http://localhost:8000/user
router.put('/:id', authPermission, udpateUserByIDHandler);

// DELETE => http://localhost:8000/user
router.delete('/:id', authPermission, deleteUserByIDHandler);

// to clear all data
router.delete('/', authPermission, clearUserDataHandler)


export default router;
