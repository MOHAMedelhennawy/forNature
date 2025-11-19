import { getAllCartItemsService, changeCartItemQuantity } from "../services/cartItemsServices.js";
import { createData, deleteDataByID, updateDataByID } from "../services/dataService.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getAllCartItems = catchAsync(async (req, res, next) => {
    const cart = res.locals.cart;
    const user = res.locals.user;

    // Handle non-authenticated users
    if (!user) {
        return res.status(200).json({
            message: 'User not authenticated',
            items: [],
        });
    }

    // Handle case when cart doesn't exist
    if (!cart || !cart.id) {
        return res.status(200).json({
            message: 'Cart is empty',
            items: [],
        });
    }

    // Get cart items
    const allCartItems = await getAllCartItemsService(cart.id);

    // Consistent response structure
    res.status(200).json({
        items: allCartItems || [],
        count: allCartItems?.length || 0
    });
    
    logger.info(`Retrieved ${allCartItems?.length || 0} items from cart ${cart.id} for user ${user.id}`);
});

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
