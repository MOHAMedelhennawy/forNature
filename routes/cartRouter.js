import jwt from 'jsonwebtoken'
import express from "express";
import { checkUser } from '../middleware/authMWPermission.js';
import { checkUserCart, createUserCart } from '../middleware/userCartMW.js';
import { addNewItemToCart, deleteCartItem, updateCartItem, getAllCartItems } from '../controller/cartController.js';
import { deleteDataByID } from '../services/dataService.js';

const router = express.Router();

router.get('/', getAllCartItems)

/**
 * This router to add a new cart item to user cart when the user
 * click on 'add to cart'.
 * 
 * First check the user, if user is logged in, it saves user object.
 * otherwise, user equal to null.
 * 
 * Then, check if the user has a cart, if true it's just save
 * the user cart object on 'res.locals'. otherwise, create new
 * cart.
 */
router.post('/', checkUser, checkUserCart, createUserCart, addNewItemToCart)

router.put('/:id', checkUser, checkUserCart, updateCartItem)

router.delete('/:id', checkUser, checkUserCart, deleteCartItem);

export default router;