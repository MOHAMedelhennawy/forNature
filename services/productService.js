import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient()

export const getAllProductsData = async (page, limit, categoryQuery, subCategoryQuery, minPrice, maxPrice) => {
    try {

        const queryOptions = (page && limit && !isNaN(page) && !isNaN(limit)) ? {
            skip: (page - 1) * limit,
            take: limit
        } : {};

        if (categoryQuery) {
            // convert category string to array
            // Ex: Bedroom,Dining,Kitchen => [ 'Bedroom', 'Dining', 'Kitchen' ]
            const categoryList = categoryQuery.split(',');
            queryOptions.where = {
                category: {
                    name: { in: categoryList }
                },
            }

            queryOptions.include = {
                category: true
            }
        }

        if (subCategoryQuery) {
            const subCategoryList = subCategoryQuery.split(',');

            queryOptions.where = {
                OR: [
                    {
                        ...queryOptions.where,

                    },
                    {
                        subCategory: {
                            name: { in: subCategoryList }
                        },
                    }
                ]
            }

            queryOptions.include = {
                subCategory: true
            }
        }

        if (minPrice && maxPrice) {
            queryOptions.where = {
                price: {
                    gt: minPrice,
                    lt: maxPrice
                },
                ...queryOptions.where,
            }
        }

        const data = await prisma.Product.findMany(queryOptions);
        const total = await prisma.Product.count({
            where: queryOptions.where,
        });

        console.log(queryOptions)
        return { data, total };
    } catch(error) {
        logger.error(`Failed to get data: ${error.message}`);
        throw new Error(`Failed to get data: ${error.message}`);
    }
}