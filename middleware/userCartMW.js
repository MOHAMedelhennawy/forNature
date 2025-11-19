import { getUserCartService } from '../services/cartService.js';
import { createData } from '../services/dataService.js';
import logger from '../utils/logger.js';

export const checkUserCart = async (req, res, next) => {
    
    try {
        const user = res.locals.user;
        
        if (!user) return next()

        const userCart = await getUserCart(user);
        if (userCart) {
            res.locals.cart = userCart;
            logger.info(`User with ID ${user.id} has an existing cart.`);
        } else {
            logger.warn(`User not has a cart`);
            res.locals.cart = null;
        }
        
        next();
    } catch (error) {
        logger.error(`${error.message}`);
        next(error);
    }
};

export const createUserCart = async (req, res, next) => {
    try {
        const user = res.locals.user;
        const userCart = res.locals.cart;

        if (!userCart) {
            const newCart = await createData('cart', { user_id: user.id });
            res.locals.cart = newCart;
            logger.info('User cart created successfully');
        }

        next();
    } catch (error) {
        logger.error(`Failed to create user cart: ${error.message}`)
        next(error)
    }
}
