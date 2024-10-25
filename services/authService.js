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
        throw new Error('Server error during username check');
    }
}

export const checkEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        return user;
    } catch(error) {
        throw new Error('Server error during email check');
    }
}

export const generateAuthToken = (user, maxAge) => {
    const token = jwt.sign({
        userid: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        isAdmin: user.isAdmin,
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
        throw new Error('Error validating the password');
    }

}