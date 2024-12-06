import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import logger from "../utils/logger.js";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export const checkUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: {username}
        })
        return user;
    } catch(error) {
        throw new Error(error.message)
    }
}

export const checkEmail = async (email) => {
    try {
        logger.info('Email is checked successfully!');
        const user = await prisma.user.findUnique({
            where: {email}
        })
        return user;
    } catch(error) {
        throw new Error(error.message)
    }
}

export const generateAuthToken = (user, maxAge = 12 * 60 * 60) => {
    const token = jwt.sign({
        userid: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: maxAge }
    );
    return token;
}


export const checkValidPassword = async (user, password) => {
    try {
        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch;
    } catch (error) {
        throw new Error(error.message)
    }

}