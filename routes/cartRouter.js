import jwt from 'jsonwebtoken'
import express from "express";
import { checkUser } from '../middleware/authMWPermission.js';
import { checkUserCart } from '../middleware/userCartMW.js';
import { addNewItemToCart, saveCartItemUpdate } from '../controller/cartController.js';

const router = express.Router();

router.post('/', checkUser, checkUserCart, addNewItemToCart)

router.put('/', saveCartItemUpdate)

export default router;