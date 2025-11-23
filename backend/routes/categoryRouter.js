import express from "express";
import { getCategoryWithSubCategories } from "../controller/categoryController.js";

const router = express.Router();

router.get('/', getCategoryWithSubCategories);

export default router;