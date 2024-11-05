import express from "express";
import { getAllProducts } from "../controller/productsController.js";
import { checkUser } from "../middleware/authMWPermission.js";
const router = express.Router();



router.get('/', checkUser, getAllProducts);
export default router;
