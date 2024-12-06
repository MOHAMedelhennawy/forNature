import { checkEmail, checkUsername } from '../services/authService.js';
import logger from '../utils/logger.js';
import validator from '../validators/userValidator.js'

/**
 * return validation error in this format: {
 * message: 'validation failed',
 * errors: [{field: '', message: ''}]
 * }
 */

const userValidatorMiddleware = async (req, res, next) => {
    let errors = []; // [ { field: '', message: '' }, ... ]
    const valid = validator(req.body);

    if (!valid) {
        errors.push(...validator.errors.map(error => ({
            field: error.instancePath.replace('/', ''),
            message: error.message,
        })));
    }

    const checkValidEmail = await checkEmail(req.body.email)
    if (checkValidEmail) {
        logger.error('Email already exist');
        errors.push({
            field: 'email',
            message: 'Email Already Exist'
        })
    }

    const checkValidUsername = await checkUsername(req.body.username);
    if (checkValidUsername) {
        logger.error('Username already exist');
        errors.push({
            field: 'username',
            message: 'Username Already Exist'
        })
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: 'validation error',
            errors
        })
    }

    next();
}

export default userValidatorMiddleware;
