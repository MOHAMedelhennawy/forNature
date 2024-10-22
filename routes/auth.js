import bcrypt from 'bcrypt';
import express from "express";
import jwt from 'jsonwebtoken';
import { checkEmail, generateAuthToken } from "../services/authService.js";
import { authValidator } from "../middleware/authMWvalidators.js";

const router = express.Router();

// new request operation
router.post('/', authValidator, async(req, res, next) => {

    try {
        const user = await checkEmail(req.body.email)
        if (!user) {
            return res.status(400).send({ message: 'Invalid email or password' })
        }
    
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if(!validPassword) {
            return res.status(400).send({ message: 'Invalid email or password' })
        }
    
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Request can't be fullfilled, Token is not defined"})
        }

        // const token = jwt.sign({userid: user.id}, config.get('JWT_SECRET'));

        const token = generateAuthToken(user);
        res.status(201).
        header('x-auth-token', token).
        json({ message: 'loggin successfully!'});
    } catch(error) {
        throw new Error(`Failed to loggin: ${error.message}`);
        
    }
})




export default router