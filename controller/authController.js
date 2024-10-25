import bcrypt from 'bcrypt';
import { checkEmail, generateAuthToken } from "../services/authService.js";
import logger from '../utils/logger.js';

export const signup_get = async (req, res, next) => {
    res.render('signup');
}

export const login_get = async (req, res, next) => {
    res.render('login');
}

export const login_post = async (req, res, next) => {
    const user = req.user;

    try {
        const maxAge = 12 * 60 * 60;
        const token = generateAuthToken(user, maxAge);
        res.cookie('x-auth-token', token, { httpOnly: true, maxAge: maxAge * 1000});
        logger.info('User logging successfully!')
        res.status(201).json(user);

    } catch (error) {
        next(error)
    }
    
}