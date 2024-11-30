import logger from '../utils/logger.js';
import validateProduct from '../validators/prodcutVlidator.js';

export const poductMWvalidator = async (req, res, next) => {
    let errorsList = [];
    const { isValid, errors } = await validateProduct(req.body);

    if (!isValid) {
        errorsList.push(errors.map(error => ({
                field: error.instancePath.replace('/', ''),
                message: error.message,
        })));
    }

    if (errorsList.length > 0) {
        console.log(errorsList)
        logger.error('Product Validation Error');
        return res.status(400).json({
            message: 'validation error',
            errorsList
        })
    }

    logger.info('Accepted Product');
    next()
}