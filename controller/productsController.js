import AppError from '../utils/handlers/AppError.js';
import catchAsync from '../utils/handlers/catchAsync.js';
import {getProductByID, getAllProductsData, createProduct} from '../services/productService.js';

export const getAllProducts = catchAsync(async (req, res) => {
    // Validate and parse page
    let page = parseInt(req.query.page);
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    // Validate and parse limit with bounds
    let limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1) {
        limit = 28;
    }
    // Set maximum limit to prevent excessive data retrieval
    const MAX_LIMIT = 100;
    if (limit > MAX_LIMIT) {
        limit = MAX_LIMIT;
    }

    // Parse and validate price filters
    let minPrice = null;
    if (req.query.minPrice) {
        minPrice = parseFloat(req.query.minPrice);
        if (isNaN(minPrice) || minPrice < 0) {
            throw new AppError('Invalid minPrice', 400, 'minPrice must be a non-negative number', true);
        }
    }

    let maxPrice = null;
    if (req.query.maxPrice) {
        maxPrice = parseFloat(req.query.maxPrice);
        if (isNaN(maxPrice) || maxPrice < 0) {
            throw new AppError('Invalid maxPrice', 400, 'maxPrice must be a non-negative number', true);
        }
    }

    // Validate price range logic
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        throw new AppError('Invalid price range', 400, 'minPrice cannot be greater than maxPrice', true);
    }

    const categories = req.query.categories || null;
    const subCategories = req.query.subCategories || null;
    const user = res.locals.user || null;

    const products = await getAllProductsData(page, limit, categories, subCategories, minPrice, maxPrice);
    const totalItems = products.total;

    res.status(200).json({
        products: products.data,
        user,
        page,
        limit,
        totalItems,
        pages: totalItems > 0 ? Math.ceil(totalItems / limit) : 0
    });
});

export const getProductById = catchAsync(async (req, res) => {
    const id = req.params?.id?.trim();
    const user = res.locals.user;
    
    if (!id || id === '') {
        throw new AppError('Product ID is required', 400, 'Product ID is required and cannot be empty', true);
    }

    const product = await getProductByID(id, true);

    res.status(200).json({ product, user });
});

export const addNewProduct = catchAsync(async (req, res) => {
    // Validate file upload (HTTP-specific, stays in controller)
    if (!req.file) {
        throw new AppError('Image file is required', 400, 'No image file was uploaded', true);
    }

    // Delegate business logic and validation to service
    const newProduct = await createProduct(req.body, req.file.filename);

    res.status(201).json({
        message: 'Product added successfully!',
        newProduct
    });
});