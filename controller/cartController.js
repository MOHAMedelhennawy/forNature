import { updateCartItem } from "../services/cartService.js";
import { createData } from "../services/dataService.js";
import logger from "../utils/logger.js";

export const addNewItemToCart = (req, res, next) => {
    const user = res.locals.user;
    const cart = res.locals.cart;
    const product = req.body;

    try {
        if (!product.id) {
            logger.error('product id is undefined');
            throw new Error("Product ID is missing.");
        }

        const newItem = createData('cartItem', {
            cart_id: cart.id,
            product_id: product.id,
            quantity: 1
        });

        logger.info('Cart item created successfully');
        res.status(201).json( {message: 'Cart item created successfully!'} )
    } catch (error) {
        logger.error(error.message);
        return next(error);
    }

    next();
}

export const saveCartItemUpdate = async (req, res, next) => {
    try {
        const product = req.body;

        if (product) {
            const updatedProduct = await updateCartItem(product.id, product.quantity)
            logger.info('Cart item updated successfully!');
        } else {
            throw new Error('Product is missing');
        }
    } catch (error) {
        next(error);
    }
}