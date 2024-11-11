import express from "express";
import { getAllProducts } from "../controller/productsController.js";
import { checkUser } from "../middleware/authMWPermission.js";
import { logout } from "../controller/authController.js";
const router = express.Router();



router.get('/', getAllProducts);
export default router;
