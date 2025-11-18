import logger from '../utils/logger.js';
import validateProduct from '../validators/prodcutVlidator.js';

export const poductMWvalidator = async (req, res, next) => {
    let errors = [];
    const validationResult = await validateProduct(req.body);

    if (validationResult !== true) {
        errors.push(...validationResult.map(error => ({
            field: error.instancePath.replace('/', ''),
            message: error.message,
        })));
    }

    if (errors.length > 0) {
        logger.error('Product Validation Error');
        return res.status(400).json({
            message: 'validation error',
            errors,
        });
    }

    logger.info('Accepted Product');
    next();
};