import express from 'express';
import userValidator from '../middleware/userMWValidators.js';
import { clearData, createData, deleteDataByID, getAllData, getDataByID, updateDataByID } from '../controller/base.js';
import passowrdHashing from '../middleware/passwordHashing.js';
import { checkUsername, checkEmail } from '../controller/user.js'

const router = express.Router();

// GET => http://localhost:8000/user/:id
router.get('/:id', async (req, res, next) => {
    const id = req.params.id;

    try {
        const user = await getDataByID('user', id);
        res.status(200).json(user);
    } catch(error) {
        next(error);
    }
})

// GET => http://localhost:8000/user
// GET => http://localhost:8000/user?limit=10
router.get('/', async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    console.log(limit)

    try {
        const users = await getAllData('user', limit);
        res.status(200).json(users);
    } catch(error) {
        next(error);
    }
})

// POST => http://localhost:8000/user
router.post('/', userValidator, passowrdHashing, async (req, res, next) => {
    try {
        const checkValidUsername = await checkUsername(req.body.username);
        const checkValidEmail = await checkEmail(req.body.email);

        if (checkValidUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        if (checkValidEmail) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        console.log("i'm here")
        const user = await createData('user', req.body);

        res.status(201).json(user);
    } catch(error) {
        next(error);
    }
})

// PUT => http://localhost:8000/user
router.put('/:id', async (req, res, next) => {
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
})

// DELETE => http://localhost:8000/user
router.delete('/:id', async (req, res, next) => {
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
})

// to clear all data
router.delete('/', async (req, res, next) => {
    if (req.query.clear == 'true') {
        try {
            await clearData('user')
            res.status(200).json({message: 'Data cleared successfully'})
        } catch(error) {
            next(error)
        }
    }
})
export default router;
