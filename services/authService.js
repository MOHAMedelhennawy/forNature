import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export const checkUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: {username}
        })
        return user;
    } catch(error) {
        next(error);
    }
}

export const checkEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })
        return user;
    } catch(error) {
        next(error);
    }
}

export const generateAuthToken = (user, maxAge) => {
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
        next(error);
    }

}