import { validate as isValidUUID } from 'uuid';
import AppError from './handlers/AppError.js';

/**
 * Builds include clause for product details
 * @param {boolean} includeDetails - Whether to include related data
 * @returns {Object|null} Include clause object or null
 */
export const buildProductIncludeClause = (includeDetails) => {
    if (!includeDetails) return null;
    
    return {
        category: true,
        subCategory: true,
        reviews: {
            select: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        image: true
                    }
                },
                review: true,
                rating: true,
            }
        },
    };
};

/**
 * Validates product ID format
 * @param {string} id - Product ID to validate
 * @throws {AppError} If ID is invalid
 */
export const validateProductId = (id) => {
    if (!id) {
        throw new AppError('Invalid product ID', 400, 'Product ID is required and cannot be empty', true);
    }
    if (!isValidUUID(id)) {
        throw new AppError('Invalid product ID', 400, `Invalid product ID format. Expected UUID, received: ${id}`, true);
    }
};

