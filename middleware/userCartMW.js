import { createUserCartService, getUserCartService } from '../services/cartService.js';
import catchAsync from '../utils/handlers/catchAsync.js';
import logger from '../utils/logger.js';

export const checkUserCart = catchAsync(async (req, res, next) => {
    const user = res.locals.user;
    
    if (!user) return next()

    const userCart = await getUserCartService(user);
    console.log(userCart)
    if (userCart) {
        res.locals.cart = userCart;
        logger.info(`User with ID ${user.id} has an existing cart.`);
    } else {
        logger.warn(`User not has a cart`);
        res.locals.cart = null;
    }
    
    next();
});

export const createUserCart = catchAsync(async (req, res, next) => {
    const user = res.locals.user;
    const userCart = res.locals.cart;

    if (!userCart) {
        const newCart = await createUserCartService(user);
        res.locals.cart = newCart;
        logger.info('User cart created successfully');
    }

    next();
});
