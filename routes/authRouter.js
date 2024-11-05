import express from "express";
import { authMWValidator } from "../middleware/authMWvalidators.js";
import userMWValidator from '../middleware/userMWValidators.js';
import passowrdHashing from '../utils/passwordHashing.js';
import { requireAuth, checkUser } from '../middleware/authMWPermission.js';
import { addNewUserController } from "../controller/userController.js";
import { login_get, login_post, logout, signup_get } from '../controller/authController.js';

const router = express.Router();

// new request operation
router.get('/signup', signup_get)

/**
 * When user enter info, it's going throw userMW.. first to
 * check if the user input is valid or not, and check if there
 * any field is empty and the fields Comply with laws.
 * 
 * if every thing is fine then the user created successfully.
 */
router.post('/signup', userMWValidator, addNewUserController);

router.get('/login', login_get)

router.post('/login', authMWValidator, login_post)

router.get('/logout', logout)
export default router