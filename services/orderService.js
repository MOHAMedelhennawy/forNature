import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const deleteAllOrderItemsByOrderID = async (order_id) => {
    try {
        if (!order_id) throw new Error('Id is missing');
        
        return await prisma.OrderItems.deleteMany({
            where: {
                order_id
            }
        });
    } catch (error) {
        throw new Error(`Failed to delete cart items: ${error.message}`);
    }
}