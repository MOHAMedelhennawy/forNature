import { prisma } from '../utils/prismaClient.js';
import logger from '../utils/logger.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';


export const getOrderWithUserInformation = handlePrismaQuery(async (id) => {
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
});

export const getAllOrdersService = handlePrismaQuery(async () => {
    return await prisma.Order.findMany({});
});

export const createOrderService = handlePrismaQuery(async (user_id, total_cost) => {
    return await prisma.Order.create({
        data: {
            user_id,
            total_cost,
        }
    });
});

export const deleteAllOrderItemsByOrderIDService = handlePrismaQuery(async (order_id) => {    
    return await prisma.OrderItems.deleteMany({
        where: {
            order_id
        }
    });
});

export const deleteDataByIDService = handlePrismaQuery(async (id) => {
    return await prisma.Order.delete({
        where: {
            id
        }
    });
});