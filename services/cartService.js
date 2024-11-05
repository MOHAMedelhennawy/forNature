import { Prisma, PrismaClient } from '@prisma/client';

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

export const updateCartItem = async (id, quantity) => {
    if (id) {
        try {
            return await prisma.CartItems.update({
                where: {id: id},
                data: {
                    quantity,
                }
            })
        } catch(error) {
            throw new Error(`Failed to update data: ${error.message}`);
        }
    } else {
        throw new Error(`Id is missing`);
    }
}