import validator from '../validators/userValidator.js'

const userValidatorMiddleware = (req, res, next) => {
    const valid = validator(req.body);

    if (!valid) {
        return res.status(403).json({ message: 'Validation failed: invalid input' });
    }

    next();
}

export default userValidatorMiddleware