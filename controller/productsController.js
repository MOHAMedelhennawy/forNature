import logger from '../utils/logger.js';
import { createData, getAllData, getDataByID, getTotalItems } from '../services/dataService.js';
import { getAllProductsData } from '../services/productService.js';

export const getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 28;
        const categories = req.query.categories || null;
        const subCategories = req.query.subCategories || null;
        const minPrice = req.query.minPrice || null;
        const maxPrice = req.query.maxPrice || null;
        const user = res.locals.user || null;

        const products = await getAllProductsData(page, limit, categories, subCategories, minPrice, maxPrice);
        const totalItems = products.total;

        res.status(200).json({
            products: products.data,
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

export const addNewProduct = async (req, res, next) => {
    try {
        req.body.image = req.file.filename;
        req.body.price = parseFloat(req.body.price)
        req.body.quantity = parseInt(req.body.quantity)
        
        const newProduct = await createData('product', req.body);
        logger.info('Product added successfully!');
        res.status(200).json({
            message: 'Product added successfull!',
            newProduct
        })
    } catch (error) {
        logger.error(error.message)
        next(error);
    }
}