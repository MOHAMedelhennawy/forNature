import logger from '../utils/logger.js';
import { validate as isValidUUID } from 'uuid';
import hashPassword from '../utils/passwordHashing.js';
import { checkUsername, checkEmail, generateAuthToken } from '../services/authService.js'
import catchAsync from '../utils/handlers/catchAsync.js';
import AppError from '../utils/handlers/AppError.js';
import { createNewUserService, deleteUserByIdService, getAllUsersService, updateUserByIdService, getUserWithIdService } from '../services/userService.js';

export const getUserByIDController =  catchAsync(async (req, res) => {
    const id = req.params.id || null;

    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
        throw new AppError('Invalid user ID', 400, 'Invalid user ID or cannot be empty', true);
    }

    const user = await getUserWithIdService(id);

    if (!user) {
        throw new AppError(`User with id ${id} not found`, 404, 'user not found', true);
    }

    res.status(200).json(user);
});

export const getAllUsersController = catchAsync(async (req, res) => {
    const users = await getAllUsersService();

    res.status(200).json(users);
});

export const addNewUserController = catchAsync(async (req, res) => {
    const hashedPassword = await hashPassword(req.body.password);

    if (!hashedPassword) {
        throw new AppError(
            'Failed to hash password',
            500,
            'Failed to hash password',
            false
        );
    }

    const user = await createNewUserService({
        ...req.body,
        password: hashedPassword
    });

    if (!user) {
        throw new AppError('Failed to create new user', 400, 'Failed to create new user', true);
    }

    const maxAge = 12 * 60 * 60;
    const token = generateAuthToken(user, maxAge);

    res.cookie('authToken', token, { httpOnly: true, maxAge: maxAge * 1000});

    res.status(201).json({
        message: 'User created successfully!',
        user
    });
});

export const updateUserByIDController = catchAsync(async (req, res) => {
    const data = req.body;
    const id = req.params.id || null;

    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
        throw new AppError('Invalid user ID', 400, 'Invalid user ID or cannot be empty', true);
    }

    if (!data || typeof data !== 'object') {
        throw new AppError(
            'User data is missing',
            400,
            "User data is missing",
            true,
        );
    } 

    const updatedUser = await updateUserByIdService(id, req.body);

    if (!updatedUser) {
        throw new AppError(
            'Failed to update user data',
            400,
            'Failed to update user data',
            false,
        );
    }

    res.status(200).json(updatedUser);
});

export const deleteUserByIDController = catchAsync(async (req, res) => {
    const id = req.params.id;

    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
        throw new AppError('Invalid user ID', 400, 'Invalid user ID or cannot be empty', true);
    }

    const deletedUser = await deleteUserByIdService(id);

    if (!deletedUser) {
        throw new AppError(
            "Failed to delete user",
            400,
            "Failed to delete user",
            true
        );
    }

    res.status(204).send();
});
