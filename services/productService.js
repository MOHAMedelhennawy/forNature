import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient()

export const getAllProductsData = async (page, limit, categoryQuery, subCategoryQuery) => {
    try {

        const queryOptions = (page && limit && !isNaN(page) && !isNaN(limit)) ? {
            skip: (page - 1) * limit,
            take: limit
        } : {};

        if (categoryQuery) {
            // convert category string to array
            // Ex: [Bedroom,Dining,Kitchen] => [ 'Bedroom', 'Dining', 'Kitchen' ]
            // OR: Bedroom => [ 'Bedroom' ]
            const categoryList = categoryQuery.replace(/[\[\]]/g, '').split(',');
            console.log(categoryList)
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
            const subCategoryList = subCategoryQuery.replace(/[\[\]]/g, '').split(',');

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

        return await prisma.Product.findMany(queryOptions);
    } catch(error) {
        logger.error(`Failed to get data: ${error.message}`);
        throw new Error(`Failed to get data: ${error.message}`);
    }
}