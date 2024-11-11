import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserCart = async (user) => {

    try {
        const data = await prisma.Cart.findUnique({
            where: {user_id: user.id}
        });
        return data || null;
    } catch (error) {
        throw new Error(error.message)
    }
}

export const getAllItems = async (cart_id) => {

    try {
        const data = await prisma.CartItems.findMany({
            where: {cart_id}
        });
        return data;
    } catch(error) {
        throw new Error(`Failed to get data: ${error.message}`);
    }
}

export const changeCartItemQuantity = async (id, quantity) => {
    if (!id) throw new Error('Id is missing');

    try {
        return await prisma.CartItems.update({
            where: {id: id},
            data: {
                quantity
            }
        })
    } catch (error) {
        throw new Error(error.message);
    }

}
