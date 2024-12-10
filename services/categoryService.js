import { PrismaClient } from '@prisma/client';
import logger from "../utils/logger.js";


const prisma = new PrismaClient();

export const getCategoryAndSubCatgeory = async (id, name) => {
    try {
        const where = name ? { name } : {};

        const data = await prisma.Category.findMany({
            where,
            select: {
                id: true,
                name: true,
                subCategories: {
                    select: {
                        id: true,
                        name: true
                    }
                },
            },
        })

    return data
    } catch (error) {
        logger.error(error.message)
        throw new Error(error.message);
    }
}