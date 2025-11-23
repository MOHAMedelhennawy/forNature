import logger from '../utils/logger.js';
import { prisma } from '../utils/prismaClient.js';
import AppError from '../utils/handlers/AppError.js';
import { buildProductIncludeClause, validateProductId } from '../utils/productHelpers.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';

export const getAllProductsData = handlePrismaQuery(async (page, limit, categoryQuery, subCategoryQuery, minPrice, maxPrice) => {
    // Build pagination options
    const paginationOptions = {};
    if (page && limit && !isNaN(page) && !isNaN(limit)) {
        paginationOptions.skip = (page - 1) * limit;
        paginationOptions.take = parseInt(limit);
    }

    // Build where clause incrementally
    const whereClause = {};
    const includeClause = {};

    // Handle category filter
    if (categoryQuery) {
        const categoryList = categoryQuery.split(',').map(cat => cat.trim()).filter(Boolean);
        if (categoryList.length > 0) {
            whereClause.category = {
                name: { in: categoryList }
            };
            includeClause.category = true;
        }
    }

    // Handle subCategory filter
    if (subCategoryQuery) {
        const subCategoryList = subCategoryQuery.split(',').map(sub => sub.trim()).filter(Boolean);
        if (subCategoryList.length > 0) {
            whereClause.subCategory = {
                name: { in: subCategoryList }
            };
            includeClause.subCategory = true;
        }
    }

    // Handle price range filter
    if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice && !isNaN(minPrice)) {
            whereClause.price.gte = parseFloat(minPrice);
        }
        if (maxPrice && !isNaN(maxPrice)) {
            whereClause.price.lte = parseFloat(maxPrice);
        }
    }

    // Build final query options
    const queryOptions = {
        ...paginationOptions,
        where: whereClause,
        ...(Object.keys(includeClause).length > 0 && { include: includeClause })
    };

    // Execute queries
    const [data, total] = await Promise.all([
        prisma.Product.findMany(queryOptions),
        prisma.Product.count({ where: whereClause })
    ]);

    return { data, total };
});

/**
 * Fetches a product by ID with optional related data
 * @param {string} id - Product UUID
 * @param {boolean} includeDetails - Whether to include category, subCategory, and reviews
 * @returns {Promise<Object>} Product data
 * @throws {AppError} If product not found or ID is invalid
 */
export const getProductByID = handlePrismaQuery(async (id, includeDetails = false) => {
    validateProductId(id);
    
    const include = buildProductIncludeClause(includeDetails);
    
    const product = await prisma.Product.findUnique({
        where: { id },
        ...(include && { include }),
    });

    if (!product) {
        throw new AppError('Product not found', 404, `Product with ID ${id} does not exist`, true);
    }

    return product;
});

/**
 * Creates a new product with validation and data transformation
 * @param {Object} productData - Raw product data from request
 * @param {string} imageFilename - Filename of uploaded image
 * @returns {Promise<Object>} Created product
 * @throws {AppError} If validation fails
 */
export const createProduct = handlePrismaQuery(async (productData) => {
    const newProduct = await prisma.Product.create({
        data: {
            ...productData,
        }
    });

    logger.info('Product created successfully');
    return newProduct;
});
