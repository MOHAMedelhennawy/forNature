import { prisma } from '../utils/prismaClient.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';
import AppError from '../utils/handlers/AppError.js';

export const getUserCartService = handlePrismaQuery(async (userId) => {
    const data = await prisma.cart.findUnique({
        where: { user_id: userId }
    });

    return data;
});

export const createUserCartService = handlePrismaQuery(async (user) => {
    const cart = await prisma.cart.$transaction(async (tx) => {
        const existingCart = await tx.cart.findUnique({
            where: { user_id: user.id }
        });

        if (existingCart) {
            throw new AppError(
                'Cart already exists for this user',
                400,
                'Create Cart Error',
                false
            );
        }

        const newCart = await tx.cart.create({
            data: {
                user_id: user.id,
                total_cost: 0
            }
        });

        return newCart;
    })
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
    const deletedCart = await prisma.cart.$transaction(async (tx) => {
        const cart = await tx.cart.findUnique({
            where: { user_id: user.id }
        });

        if (!cart) {
            throw new AppError(
                'Cart not found for this user',
                404,
                'Delete Cart Error',
                false
            );
        }
        
        const deletedCartItems = await tx.cartItem.deleteMany({
            where: { cart_id: cart.id }
        });

        const deletedCart = await tx.cart.delete({
            where: { id: cart.id }
        });

        return deletedCart;
    });

    return deletedCart; 
});