import express from "express";
import { addNewReview } from '../controller/reviewController.js'
import { checkUser } from "../middleware/authMWPermission.js";

const router = express.Router();


router.post('/',checkUser, addNewReview);

export default router;