import express from "express";
import { authMWValidator } from "../middleware/authMWvalidators.js";
import userMWValidator from '../middleware/userMWValidators.js';
import passowrdHashing from '../utils/passwordHashing.js';
import { requireAuth, checkUser } from '../middleware/authMWPermission.js';
import { addNewUserController } from "../controller/userController.js";
import { login_get, login_post, logout, signup_get } from '../controller/authController.js';
import passport from "passport";
import logger from "../utils/logger.js";
const router = express.Router();

// new request operation
router.get('/signup', signup_get)

/**
 * When user enter info, it's going throw userMWValidator first to
 * check if the user input is valid or not, and check if there
 * any field is empty and the fields Comply with laws.
 * 
 * if every thing is fine then the user created successfully.
 */
router.post('/signup', userMWValidator, addNewUserController);

router.get('/login', login_get)

router.post('/login', authMWValidator, login_post)

router.get('/logout', logout)

router.get('/auth/google', passport.authenticate('google', {
    scope: [
        'profile',
        'email',
    ],     // Define what you need to retrive from the user profile. like profile info, emails or other info
}));    

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), async (req, res, next) => {
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
});


export default router