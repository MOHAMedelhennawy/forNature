import express from "express";
import { checkAdmin, checkUser } from "../middleware/authMWPermission.js";

const router = express.Router();


router.get('/', checkAdmin, (req, res, next) => {
    res.render('admin');
})

export default router;