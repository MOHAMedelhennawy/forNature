import { getUserCart } from '../services/cartService.js';
import { Prisma, PrismaClient } from '@prisma/client';
import { createData } from '../services/dataService.js';
import logger from '../utils/logger.js';

export const checkUserCart = async (req, res, next) => {
    const user = res.locals.user;
    try {
        const userCart = await getUserCart(user);

        if(userCart) {
            res.locals.cart = userCart;
            logger.info('User has cart');
            next();
        } else {
            const newCart = await createData('cart', {user_id: user.id});
            logger.info('Cart created successfully');
            req.locals.cart = newCart;
            next();
        }
    } catch (error) {
        next(error);
    }
}
