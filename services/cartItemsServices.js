import { PrismaClient } from '@prisma/client';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';
import AppError from '../utils/handlers/AppError.js';

const prisma = new PrismaClient();

// get all cart items
// delete items from cart
// update item from cart
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

export const addNewItemToCartService = handlePrismaQuery(async (product_id, cart_id) => {
    const data = await prisma.cartItems.create({
        data: {
            product_id,
            cart_id,
            quantity: 1,
        }
    });

    return data;
});

export const changeCartItemQuantityService = handlePrismaQuery(async (id, quantity) => {
   return await prisma.cartItems.update({
        where: {id: id},
        data: {
            quantity
        },
       include: { 
            product: {
                select: {
                    price: true,
                }
            }
        }
    })
});

export const deleteAllCartItemsByCartID = handlePrismaQuery(async (cart_id) => {
    if (!cart_id) throw new Error('Id is missing');
    
    return await prisma.cartItems.deleteMany({
        where: {
            cart_id
        }
    });
});