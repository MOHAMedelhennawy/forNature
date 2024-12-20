import express from "express";
import { authMWValidator } from "../middleware/authMWvalidators.js";
import userMWValidator from '../middleware/userMWValidators.js';
import passowrdHashing from '../utils/passwordHashing.js';
import { requireAuth, checkUser } from '../middleware/authMWPermission.js';
import { addNewUserController } from "../controller/userController.js";
import { googleOAthCallbackController, googleOAuthController, login_get, login_post, logout, signup_get } from '../controller/authController.js';
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

router.get('/auth/google', googleOAuthController);    

router.get('/auth/google/callback', passport.authenticate('google', { session: false }), googleOAthCallbackController);


export default router