import logger from '../utils/logger.js';
import { getAllData, getDataByID, getTotalItems } from '../services/dataService.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 28;
        const user = res.locals.user || null;

        const totalItems = await getTotalItems('product');
        const products = await getAllData('product', page, limit);

        res.status(200).json({
            products,
            user,
            page,
            limit,
            totalItems,
            pages: Math.ceil(totalItems / limit),

        });
    } catch (error) {
        logger.error("Error fetching products:", error.message);
        next(error);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const id = req.params.id || undefined;

        if (!id)
            res.status(404).json({ error: 'product id is missing'});

        const product = await getDataByID('product', id);

        res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}