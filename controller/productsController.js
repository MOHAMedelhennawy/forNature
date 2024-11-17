import logger from '../utils/logger.js';
import { getAllData, getDataByID } from '../services/dataService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const user = res.locals.user || undefined;

        const totalItems = await prisma.product.count();
        const products = await getAllData('product', page, limit);

        logger.info('Get all products ...')
        res.status(200).json({ products, user, totalItems });
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