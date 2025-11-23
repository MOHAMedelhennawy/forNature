import express from "express";
import { createNewCartController, deleteCart, getCartByUserIDController } from "../controller/cartController.js";
import { authenticate } from "../middleware/authMWPermission.js";

const router = express.Router();

router.use(authenticate);

router.get('/', getCartByUserIDController);
router.post('/', createNewCartController);
router.delete('/', deleteCart);

export default router;