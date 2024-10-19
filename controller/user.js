import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

export const checkUsername = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: {username}
        })

        return user;
    } catch(error) {
        res.status(500).json({message: 'server error during check username'})
    }
}

export const checkEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {email}
        })

        return user;
    } catch(error) {
        res.status(500).json({message: 'server error during check email'})
    }
}