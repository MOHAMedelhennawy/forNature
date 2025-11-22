import express from "express";
import { addNewOrder, addOrderItems, getOrders, deleteOrder, updateOrderStatus, getOrderById } from "../controller/orderController.js";
import { checkAdmin, checkUser, requireAuth } from "../middleware/authMWPermission.js";
import { deleteCart } from "../controller/cartController.js";
import { checkUserCart } from '../middleware/userCartMW.js'
const router = express.Router();

router.get('/:id', getOrderById);
router.get('/', getOrders);
router.post('/', requireAuth, checkUser, checkUserCart, addNewOrder, addOrderItems, deleteCart)
router.delete('/:id', checkUser, checkAdmin, deleteOrder);
router.patch('/:id/status', checkUser, checkAdmin, updateOrderStatus);

export default router;