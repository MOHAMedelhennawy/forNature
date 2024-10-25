import logger from '../utils/logger.js';
import { validate as isValidUUID } from 'uuid';
import { checkUsername, checkEmail, generateAuthToken } from '../services/authService.js'
import { clearData, createData, deleteDataByID, getAllData, getDataByID, updateDataByID } from '../controller/base.js';
import hashPassword from '../utils/passwordHashing.js';

export const getUserByIDHandler =  async (req, res, next) => {
    const id = req.params.id || null;

    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
        return res.status(400).json( {message: 'Invalid or missing ID' });
    }

    try {
        const user = await getDataByID('user', id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch(error) {
        next(error);
    }
}


export const getAllUsersHandler = async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;

    try {
        const users = await getAllData('user', limit);

        if(!users) {
            return res.status(404).json({ message: 'No users found'});
        }

        res.status(200).json(users);
    } catch(error) {
        next(error);
    }
}

export const addNewUserHandler = async (req, res, next) => {
    try {

        // const checkValidUsername = await checkUsername(req.body.username);
        // if (checkValidUsername) {
        //     return res.status(400).json({
        //         failed: 'invalid username',
        //         message: 'username already exist'

        //     });
        // }
        
        // const checkValidEmail = await checkEmail(req.body.email);
        // if (checkValidEmail) {
        //     return res.status(400).json({
        //         failed: 'invalid email',
        //         message: 'email already exist'
        //     });
        // }

        const hashedPassword = await hashPassword(req.body.password);
        if (!hashedPassword) {
            return res.status(404).json({ message: 'Failed to hash password'});
        }

        const user = await createData('user', {
            ...req.body,
            password: hashedPassword
        });

        if (!user) {
            return res.status(500).json({ message: `Failed to create user` } );
        }


        const maxAge = 12 * 60 * 60;
        const token = generateAuthToken(user, maxAge);
        res.cookie('x-auth-token', token, { httpOnly: true, maxAge: maxAge * 1000});
        logger.info('User created successfully!')
        res.status(201).
            json(user);
        // header('x-auth-token', token).
    } catch(error) {
        next(error);
    }
}

export const udpateUserByIDHandler = async (req, res, next) => {
    const id = req.params.id;

    try {
        const updatedUser = await updateDataByID('user', id, req.body);

        if (!updatedUser) {
            return res.status(404).json({message: 'Usre not found'});
        }

        res.status(200).json(updatedUser);
    } catch(error) {
        next(error);
    }
}


export const deleteUserByIDHandler = async (req, res, next) => {
    const id = req.params.id;

    try {
        const deletedUser = await deleteDataByID('user', id);

        if (!deletedUser) {
            return res.status(404).json({message: 'User not found'});
        }

        res.status(204).json({message: `User deleted successfully.`});
    } catch(error) {
        next(error);
    }
}

export const clearUserDataHandler = async (req, res, next) => {
    if (req.query.clear == 'true') {
        try {
            await clearData('user')
            res.status(200).json({message: 'Data cleared successfully'})
        } catch(error) {
            next(error)
        }
    }
}