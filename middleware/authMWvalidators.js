import validator from '../validators/authValidators.js'

export const authValidator = (req, res, next) => {
    const valid = validator(req.body);

    if (!valid) {
        return res.status(403).json({ message: 'Validation failed: invalid input' });
    }

    next();
}