import { createUserCartService, deleteUserCartService, getUserCartService } from "../services/cartService.js";
import catchAsync from "../utils/handlers/catchAsync.js";
import logger from "../utils/logger.js";

export const getCartByUserIDController = catchAsync(async (req, res) => {
    const { user } = res.locals;

    const cart = await getUserCartService(user.id);

    logger.debug('Cart retrieved', { userId: user.id, cartId: cart?.id });
    res.status(200).json({ cart });
});

export const createNewCartController = catchAsync(async (req, res) => {
    const { user } = res.locals;

    const cart = await createUserCartService(user.id);
    logger.info('Cart created', { userId: user.id, cartId: cart.id });

    res.status(201).json({
        message: "Cart created successfully",
        cart
    })
});

export const deleteCart = catchAsync(async (req, res) => {
    const { user } = res.locals;

    await deleteUserCartService(user.id);
    logger.info('Cart deleted', { userId: user.id });

    res.status(204).send();
});