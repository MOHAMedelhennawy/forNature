import express from "express";
import { createNewCartController, deleteCart, getCartByUserIDController } from "../controller/cartController.js";

const router = express.Router();

router.get('/', getCartByUserIDController);
router.post('/', createNewCartController);
router.delete('/', deleteCart);

export default router;