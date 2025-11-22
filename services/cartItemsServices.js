import { prisma } from '../utils/prismaClient.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';

export const getCartItemByIDService = handlePrismaQuery(async (id) => {
    const data = await prisma.cartItems.findUnique({
        where: { id },
        include: { 
            product: {
                select: {
                    price: true,
                }
            }
        }
    });
    
    return data;
});

export const getAllCartItemsService = handlePrismaQuery(async (cart_id) => {
    const data = await prisma.cartItems.findMany({
        where: { cart_id }
    });

    return data;
});

export const getCartTotalCostService = handlePrismaQuery(async (cart_id) => {
    return await prisma.cartItems.aggregate({
        where: { cart_id },
        _sum: { total_price: true },
    });
});

export const addNewItemToCartService = handlePrismaQuery(async (product_id, cart_id, price) => {
    const data = await prisma.cartItems.create({
        data: {
            product_id,
            cart_id,
            total_price: price,
            quantity: 1,
        }
    });

    return data;
});

export const updateCartItemQuantityService = handlePrismaQuery(async (id, quantity, total_price) => {
   return await prisma.cartItems.update({
        where: {id: id},
        data: {
            quantity,
            total_price,
        },
    })
});

export const deleteCartItemByIDService = handlePrismaQuery(async (id) => {
    return await prisma.cartItems.delete({
        where: {
            id,
        }
    });
});

export const deleteAllCartItemsByCartIDService = handlePrismaQuery(async (cart_id) => {
    return await prisma.cartItems.deleteMany({
        where: {
            cart_id
        }
    });
});