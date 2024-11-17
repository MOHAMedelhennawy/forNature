import express from "express";
import { getAllProducts, getProductById } from "../controller/productsController.js";
import { checkUser } from "../middleware/authMWPermission.js";
import { logout } from "../controller/authController.js";
const router = express.Router();



router.get('/', getAllProducts);
router.get('/:id', getProductById)
export default router;
