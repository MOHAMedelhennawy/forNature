import express from "express";
import { checkUser } from '../middleware/authMWPermission.js';
import { checkUserCart, createUserCart } from '../middleware/userCartMW.js';
import { addNewItemToCart, getAllCartItems, updateCartItemQuantity } from "../controller/catItemsController.js";

const router = express.Router();

router.get('/', checkUser, checkUserCart, getAllCartItems);

router.post('/', checkUser, checkUserCart, createUserCart, addNewItemToCart);

router.patch('/:id', checkUser, checkUserCart, updateCartItemQuantity);

// router.delete('/:id', checkUser, checkUserCart, deleteCartItem);

export default router;