import { createUserCartService, deleteUserCartService, getUserCartService } from "../services/cartService.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getCartByUserIDController = catchAsync(async (req, res) => {
    const user = res.locals.user;

    if (!user || !user.id) {
        return res.status(401).json({
            message: 'User not authenticated',
            cart: null,
        });
    }

    const cart = await getUserCartService(user);

    res.status(200).json({
        cart: cart || null
    });
});

export const createNewCartController = catchAsync(async (req, res) => {
    const user = res.locals.user;

    if (!user || !user.id) {
        return res.status(401).json({
            message: 'User not authenticated',
            cart: null,
        });
    }

    const cart = await createUserCartService(user);

    res.status(201).json({
        message: "Cart created successfully",
        cart
    })
});

export const deleteCart = catchAsync(async (req, res) => {
    const user = res.locals.user;

    if (!user || !user.id) {
        return res.status(401).json({
            message: 'User not authenticated',
            cart: null,
        });
    }
    
    // const deletedItems = await deleteAllCartItemsByCartID(cart.id);
    const deletedCart = await deleteUserCartService(user);

    res.status(204).json( { message: 'Cart deleted successfully' });
});