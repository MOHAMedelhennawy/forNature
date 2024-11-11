import { getUserCart } from '../services/cartService.js';
import { createData } from '../services/dataService.js';
import logger from '../utils/logger.js';

export const checkUserCart = async (req, res, next) => {
    
    try {
        const user = res.locals.user;
        
        if (!user) next();

        const userCart = await getUserCart(user);
        if (userCart) {
            res.locals.cart = userCart;
            logger.info(`User with ID ${user.id} has an existing cart.`);
        } else {
            const newCart = await createData('cart', { user_id: user.id });
            logger.info(`New cart created successfully for user with ID ${user.id}.`);
            res.locals.cart = newCart;
        }
        
        next();
    } catch (error) {
        logger.error(`${error.message}`);
        next(error);
    }
};
