import { getAllCartItemsService, changeCartItemQuantityService, addNewItemToCartService, getCartItemByIDService } from "../services/cartItemsServices.js";
import { updateCartTotalCostService } from "../services/cartService.js";
import { deleteDataByID, updateDataByID } from "../services/dataService.js";
import AppError from "../utils/handlers/AppError.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getAllCartItems = catchAsync(async (req, res, next) => {
    const { cart, user } = res.locals;

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

export const addNewItemToCart = catchAsync(async (req, res, next) => {
    const { cart } = res.locals;
    const { productId, price } = req.body;
    
    const missing = [];
    if (!productId) missing.push('productId');
    if (price == null) missing.push('price');

    if (missing.length) {
        throw new AppError(
            `Missing required field${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Please include ${missing.length > 1 ? 'them' : 'it'} in the request body.`,
            400
        );
    }
    
    const newItem = await addNewItemToCartService(productId, cart.id);
    const totalCost = parseFloat(cart.total_cost) + parseFloat(price);

    await updateCartTotalCostService(cart.id, totalCost);

    logger.info(`Cart item added successfully with product ID: ${productId}`);
    res.status(201).json(newItem);
});

export const updateCartItemQuantity = catchAsync(async (req, res, next) => {
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    const { cart } = res.locals;

    if (!quantity || quantity <= 0) {
        throw new AppError("Quantity must be at least 1.", 400, "Missing Data", false);
    }

    if (!cart) {    
        throw new AppError("Cart not found.", 404, "Cart Not Found", false);
    }

    const item = await changeCartItemQuantityService(cartItemId, quantity);
    if (!item) {
        throw new AppError("Cart item not found.", 404, "Item Not Found", false);
    }

    const cartItems = await getAllCartItemsService(cart.id);
    let totalCost = 0;
    for (const cartItem of cartItems) {
        totalCost += parseFloat(cartItem.quantity) * parseFloat(cartItem.product.price);
    }

    await updateCartTotalCostService(cart.id, totalCost);

    res.status(200).json(item);
    logger.info(`Cart item with ID ${cartItemId} updated successfully`);
});

export const deleteCartItem = catchAsync(async (req, res, next) => {
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
});

