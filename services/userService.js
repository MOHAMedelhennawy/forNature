import { prisma } from '../utils/prismaClient.js';
import { handlePrismaQuery } from "../utils/handlers/handlePrismaQuery.js";
import AppError from "../utils/handlers/AppError.js";

export const getUserWithIdService = handlePrismaQuery(async (id) => {
    const data = await prisma.user.findUnique({
        where: { id },
    });

    return data;
});

export const getAllUsersService = handlePrismaQuery(async (limit) => {
    const data = await prisma.user.findMany();

    return data;
});

export const createNewUserService = handlePrismaQuery(async (userData) => {
    if (!userData || typeof userData !== 'object') {
        throw new AppError(
            'User data is missing',
             400,
             'User data is missing',
             true
        );
    }

    const data = await prisma.user.create({
        data: userData,
    });

    return data;
});

export const updateUserByIdService = handlePrismaQuery(async (id, userData) => {
    const data = await prisma.user.update({
        where: { id },
        data: userData,
    })
});

export const deleteUserByIdService = handlePrismaQuery(async (id) => {
    const data = await prisma.user.delete({
        where: { id },
    });
});
