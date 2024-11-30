import logger from '../utils/logger.js';
import { generateAuthToken } from "../services/authService.js";

export const signup_get = async (req, res, next) => {
    const token = req.cookies.authToken;
    
    if (!token) {
        logger.info('you get signup successfully')
        res.render('signup');
    } else {
        logger.warn('You are already signed in.');
        res.render('/');
    }
    
}

export const login_get = async (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        logger.info('you get login successfully')
        res.render('login');
    } else {
        logger.warn('You are already signed in.');
        res.render('/');
    }
}

export const login_post = async (req, res, next) => {
    const user = req.user;

    try {
        const maxAge = 12 * 60 * 60;
        const token = await generateAuthToken(user, maxAge);

        res.cookie('authToken', token, { httpOnly: true, maxAge: maxAge * 1000});
        logger.info('User logging successfully!')
        res.status(201).json({ message: 'Login successful', user });
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        next(error)
    }
    
}

export const logout = async (req, res, next) => {
    res.clearCookie('authToken');
    logger.info('Logged out successfully!');
    res.redirect('/');
}