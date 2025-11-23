import express from "express";
import upload from '../config/multer.js';
import { checkAdmin, authenticate } from "../middleware/authMWPermission.js";
import { poductMWvalidator } from "../middleware/productMWvalidators.js";
import { addNewProduct, getAllProducts, getProductById } from "../controller/productsController.js";

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById)
router.post('/', authenticate, checkAdmin, upload.single('image'), poductMWvalidator, addNewProduct);

export default router;
