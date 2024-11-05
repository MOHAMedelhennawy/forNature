import logger from '../utils/logger.js';
import { getAllData } from '../services/dataService.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await getAllData('product', 100);
        const user = res.locals.user;

        logger.info('Get all products ...')
        res.status(200).json({ products, user });
    } catch (error) {
        logger.error("Error fetching products:", error.message);
        next(error);
    }
};
