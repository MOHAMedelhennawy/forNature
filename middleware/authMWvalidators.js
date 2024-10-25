import { checkEmail, checkValidPassword } from '../services/authService.js';
import validator from '../validators/authValidators.js'

export const authMWValidator = async (req, res, next) => {
    let errors = [];
    const valid = validator(req.body);
    const { email, password } = req.body;


    if (!valid) {
        errors.push(...validator.errors.map(error => ({
            field: error.instancePath.replace('/', ''),
            message: error.message
        })))

        return res.status(400).json({
                    message: 'validation error',
                    errors
                });
    }

    const userEmail = await checkEmail(email);
    if (!userEmail) {
        errors.push({
            field: 'email',
            message: `Please check your email or sign up.`
        })
    } else {
        const checkPassword = await checkValidPassword(userEmail, password);
        if (!checkPassword) {
            errors.push({
                field: 'password',
                message: 'The password you entered is incorrect. Please try again.'
            })
        } else {
            req.user = userEmail;
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            message: 'validation error',
            errors
        });
    }

    next();
}