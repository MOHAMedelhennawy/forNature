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

export const updateCartTotalCostService = handlePrismaQuery(async (cartId, _sum) => {
    const data = await prisma.cart.update({
        where: { id: cartId },
        data: {
            total_cost: _sum.total_price || 0
        }
    });

    return data;
});

export const deleteUserCartService = handlePrismaQuery(async (user) => {
    const data = await prisma.cart.delete({
        where: { user_id: user.id },
    });

    return data;
});