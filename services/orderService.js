import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

export const getOrderWithUserInformation = async (id) => {
    try {
        if (!id) throw new Error(`Order id is missing`);

        return await prisma.Order.findUnique({
            where: {
                id
            },
            include: {
                user: true,
                orderItems: {
                    include:{
                        product: {
                            include: {
                                category: true,
                                subCategory: true
                            }
                        },
                    }
                }
            }
        })
    } catch (error) {
        logger.error(`Failed to get order: ${error.message}`);
        throw new Error(`Failed to get order: ${error.message}`);
    }
}

export const deleteAllOrderItemsByOrderID = async (order_id) => {
    try {
        if (!order_id) throw new Error(`Order id is missing`)
        
        return await prisma.OrderItems.deleteMany({
            where: {
                order_id
            }
        });
    } catch (error) {
        throw new Error(`Failed to delete cart items: ${error.message}`);
    }
}