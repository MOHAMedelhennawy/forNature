import {
    getAllCartItemsService,
    updateCartItemQuantityService,
    addNewItemToCartService,
    getCartItemByIDService,
    getCartTotalCostService,
    deleteCartItemByIDService,
    addItemAndUpdateCartService,
    updateCartItemQuantityFullService,
    deleteCartItemFullService
} from "../services/cartItemsServices.js";
import { updateCartTotalCostService } from "../services/cartService.js";
import { getProductByID } from "../services/productService.js";
import AppError from "../utils/handlers/AppError.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getAllCartItems = catchAsync(async (req, res, next) => {
    const { cart, user } = res.locals;

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
    const { productId } = req.body;
    
    if (!cart) {
        throw new AppError(
            "User cart is missing",
            404,
            "User cart not found"
        )
    }

    if (!productId) {
        throw new AppError(
            "Porduct id is missing",
            400,
            "Missing id",
            false,
        );
    }

    const existingProduct = await getProductByID(productId);
    if (!existingProduct) {
        throw new AppError("Product not found.", 404, "Product not found", false);
    }

    const newItem = await addItemAndUpdateCartService(productId, cart.id, existingProduct.price);

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

    if (!cartItemId) {
        throw new AppError("Cart item id is missing.", 400, "Missing id", false);
    }
    
    const updatedItem = await updateCartItemQuantityFullService(
        cartItemId,
        cart.id,
        parseInt(quantity),
        existingItem.product.price
    );

    logger.info(`Cart item with ID ${cartItemId} updated successfully`);

    res.status(200).json(updatedItem);
});

export const deleteCartItemController = catchAsync(async (req, res, next) => {
    const { cart } = res.locals;
    const cartItemId = req.params.id;

    if (!cart) {
        throw new AppError("Cart not found.", 404, "Cart Not Found", false);
    }

    if (!cartItemId) {
        throw new AppError("Cart item id is missing.", 400, "Missing id", false);
    }

    const { deletedItem, total } = await deleteCartItemFullService(cartItemId, cart.id);

    logger.info(`Cart item with ID ${cartItemId} deleted successfully`);

    res.status(200).json({
        message: "Item deleted successfully",
        deletedItem,
        total
    });

});

