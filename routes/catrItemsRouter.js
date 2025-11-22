import express from "express";
import { checkUser } from '../middleware/authMWPermission.js';
import { checkUserCart, createUserCart } from '../middleware/userCartMW.js';
import { addNewItemToCart, deleteCartItemController, getAllCartItems, updateCartItemQuantity } from "../controller/catItemsController.js";

const router = express.Router();

router.get('/', getAllCartItems);

router.post('/', createUserCart, addNewItemToCart);

router.patch('/:id', updateCartItemQuantity);

router.delete('/:id', deleteCartItemController);

export default router;