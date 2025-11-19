import { PrismaClient } from '@prisma/client';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';
import AppError from '../utils/handlers/AppError.js';

const prisma = new PrismaClient();

// get all cart items
// delete items from cart
// update item from cart
export const getAllCartItemsService = handlePrismaQuery(async (cart_id) => {
    const data = await prisma.cartItems.findMany({
        where: { cart_id }
    });

    return data;
});

export const changeCartItemQuantity = handlePrismaQuery(async (id, quantity) => {
    if (!quantity) {
        throw new AppError("Quantity", 400, "Quantity", flase);
    }

    return await prisma.cartItems.update({
        where: {id: id},
        data: {
            quantity
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