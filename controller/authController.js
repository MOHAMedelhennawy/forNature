import passport from "passport";
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

// *************************
// *                       *
// *    GOOGLE OUTH 2.0    *
// *                       *
// *************************

export const googleOAuthController = passport.authenticate('google', {
    scope: [
        'profile',
        'email',
    ],     // Define what you need to retrive from the user profile. like profile info, emails or other info
})

export const googleOAthCallbackController = async (req, res, next) => {
    /**
     * After the user sign-in or login, it's redirect to this endpoint that 
     * you define in passport-config.js file. Then go ot passport callback function.
     * so you add this middleware 'passport.authenticate('google')'. this middleware
     */

    try {
        const { token } = req.user;
    
        const maxAge = 12 * 60 * 60;
        res.cookie('authToken', token, { httpOnly: true, maxAge: maxAge * 1000});
    
        res.redirect('/');
    } catch (error) {
        next(error);
    }
}