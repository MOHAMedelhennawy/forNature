import express from "express";
import { authMWValidator } from "../middleware/authMWvalidators.js";
import userMWValidator from '../middleware/userMWValidators.js';
import passowrdHashing from '../utils/passwordHashing.js';
import authPermission from '../middleware/authMWPermission.js';
import { addNewUserHandler } from "../handlers/userHandler.js";
import { login_get, login_post, signup_get } from '../controller/authController.js';

const router = express.Router();

// new request operation
router.get('/signup', signup_get)

// router.post('/signup', signup_post)
router.post('/signup', userMWValidator, addNewUserHandler);

router.get('/login', login_get)

router.post('/login', authMWValidator, login_post)

export default router