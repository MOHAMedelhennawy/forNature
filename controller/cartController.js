import { changeCartItemQuantity, deleteAllCartItemsByCartID, getAllItems } from "../services/cartService.js";
import { createData, deleteDataByID, getAllData, updateDataByID } from "../services/dataService.js";
import logger from "../utils/logger.js";

export const getAllCartItems = async (req, res, next) => {
    try {
        const cart = res.locals.cart;
        const user = res.locals.user;

        if (!user) {
            logger.warn('User is not authenticated. Skipping cart retrieval.');
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (cart && cart.id) {
            const allCartItems = await getAllItems(cart.id);

            res.status(200).json({ allCartItems, cart });
            logger.info(`Retrieved ${allCartItems.length} items from cart ${cart.id}`);
        } else {
            res.status(200).json({
                message: 'Cart is empty',
                items: []
            });
            logger.info(`Cart is empty for user ${user.id}`);
        }
    } catch (error) {
        logger.error(`Failed to get cart items: ${error.message}`);
        next(error);
    }
};

export const addNewItemToCart = async (req, res, next) => {
    try {
        const cart = res.locals.cart;
        const { productId, price } = req.body;

        if (!productId || !price) {
            throw new Error("Product ID or price is missing.");
        }

        const totalCost = parseFloat(cart.total_cost) + parseFloat(price);
        
        const newItem = await createData('cartItem', {
            cart_id: cart.id,
            product_id: productId,
            quantity: 1
        });

        await updateDataByID('cart', cart.id, { total_cost: totalCost });

        logger.info(`Cart item added successfully with product ID: ${productId}`);
        res.status(201).json(newItem);
    } catch (error) {
        logger.error(`Error adding item to cart: ${error.message}`);
        next(error);
    }
};


export const updateCartItem = async (req, res, next) => {
    try {
        const cartItemId = req.params.id;
        const { quantity, price } = req.body;
        const cart = res.locals.cart;

        if (!quantity || !price) {
            throw new Error("Quantity or price is missing.");
        }

        const totalCost = parseFloat(cart.total_cost) + parseFloat(price);

        const updatedItem = await changeCartItemQuantity(cartItemId, quantity);

        if (updatedItem) {
            await updateDataByID('cart', cart.id, { total_cost: totalCost });
            res.status(200).json({ updatedItem, cart });
            logger.info(`Cart item with ID ${cartItemId} updated successfully`);
        } else {
            return next(new Error('Failed to update cart item'));
        }
    } catch (error) {
        logger.error(`Error updating cart item: ${error.message}`);
        next(error);
    }
};


export const deleteCartItem = async (req, res, next) => {
    try {
        const cartItemId = req.params.id;
        const cart = res.locals.cart;
        const itemPrice = parseFloat(req.body.price);

        if (!itemPrice) {
            throw new Error("Item price is missing.");
        }

        const totalCost = parseFloat(cart.total_cost) - itemPrice;

        const deletedCartItem = await deleteDataByID('cartItem', cartItemId);

        if (deletedCartItem) {
            await updateDataByID('cart', cart.id, { total_cost: totalCost });
            res.status(204).json({ message: 'Cart item deleted successfully' });
            logger.info(`Cart item with ID ${cartItemId} deleted successfully`);
        } else {
            return next(new Error('Failed to delete cart item'));
        }
    } catch (error) {
        logger.error(`Error deleting cart item: ${error.message}`);
        next(error);
    }
};


export const deleteCart = async (req, res, next) => {
    try {
        const cart = res.locals.cart || null;

        if (!cart) throw new Error("There no cart to delete");
        
        const deletedItems = await deleteAllCartItemsByCartID(cart.id);
        const deletedCart = await deleteDataByID('cart', cart.id);

        res.status(204).json( {message: 'Cart deleted successfully' });
    } catch (error) {
        next(error);
    }
}