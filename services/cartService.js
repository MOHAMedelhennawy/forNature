import { PrismaClient } from '@prisma/client';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';

const prisma = new PrismaClient();

export const getUserCartService = handlePrismaQuery(async (user) => {
    const data = await prisma.cart.findUnique({
        where: { user_id: user.id }
    });

    return data;
});

export const createUserCartService = handlePrismaQuery(async (user) => {
    const data = await prisma.cart.create({
        data: { user_id: user.id },
    });

    return data;
});

export const updateCartTotalCostService = handlePrismaQuery(async (cartId, newTotalCost) => {
    const data = await prisma.cart.update({
        where: { id: cartId },
        data: { total_cost: newTotalCost },
    });

    return data;
});

export const deleteUserCartService = handlePrismaQuery(async (user) => {

    const data = await prisma.cart.delete({
        where: { user_id: user.id },
    });

    return data;
});