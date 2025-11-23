import { prisma } from '../utils/prismaClient.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';

export const getUserCartService = handlePrismaQuery(async (userId) => {
    const data = await prisma.cart.findUnique({
        where: { user_id: userId }
    });

    return data;
});

export const createUserCartService = handlePrismaQuery(async (userId) => {
    try {
        return await prisma.cart.create({
            data: {
                user_id: userId,
                total_cost: 0
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            throw new AppError(
                'Cart already exists for this user',
                400,
                'CART_ALREADY_EXISTS',
                false
            );
        }
        throw error;
    }
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

export const deleteUserCartService = handlePrismaQuery(async (userId) => {
    try {
        return await prisma.cart.delete({
            where: { user_id: userId }
        });
    } catch (error) {
        if (error.code === 'P2025') {
            throw new AppError(
                'Cart not found for this user',
                404,
                'CART_NOT_FOUND',
                false
            );
        }
        throw error;
    }
});