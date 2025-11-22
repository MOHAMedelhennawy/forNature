import { createUserCartService, deleteUserCartService, getUserCartService } from "../services/cartService.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getCartByUserIDController = catchAsync(async (req, res) => {
    const { user } = res.locals;

    const cart = await getUserCartService(user.id);

    logger.info(`Cart fetched for user ID: ${user.id}`);
    res.status(200).json({
        cart: cart || null
    });
});

export const createNewCartController = catchAsync(async (req, res) => {
    const { user } = res.locals;

    const cart = await createUserCartService(user);

    res.status(201).json({
        message: "Cart created successfully",
        cart
    })
});

export const deleteCart = catchAsync(async (req, res) => {
    const { user } = res.locals;

    await deleteUserCartService(user);

    res.status(204).send();
});