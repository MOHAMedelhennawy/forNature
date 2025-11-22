import logger from "../utils/logger.js";
import { createOrderService, deleteAllOrderItemsByOrderIDService, deleteDataByIDService, getAllOrdersService, getOrderWithUserInformation } from "../services/orderService.js";
import { createData, deleteDataByID, getAllData, getDataByID, updateDataByID } from "../services/dataService.js";
import { getAllCartItemsService } from "../services/cartItemsServices.js";
import catchAsync from "../utils/handlers/catchAsync.js";

export const getOrderById = catchAsync(async (req, res, next) => {
    const id = req.params?.id || null;

    if (!id) {
        throw new AppError("Order id is missing.", 400, "Missing id", false);
    }

    const order = await getOrderWithUserInformation(id);
    res.status(200).json(order);
});

export const getOrders = catchAsync(async (req, res, next) => {
    const orders = await getAllOrdersService();
    
    res.status(200).json(orders);
});

export const addNewOrder = catchAsync(async (req, res, next) => {
    const cart = res.locals?.cart;
    
    if (!cart) {
        throw new AppError("Cart not found.", 404, "Cart Not Found", false);
    }
    
    const items = await getAllCartItemsService(cart.id);
    if (!items || items.length <= 0) {
        throw new AppError("No items found in the cart.", 400, "Empty Cart", false);
    }

    const { user_id, total_cost } = cart;
    const order = await createOrderService(user_id, total_cost);

    res.locals.order = order;
    res.locals.items = items;
    next();
});

export const deleteOrder = catchAsync(async (req, res, next) => {
    const id = req.params.id || null;

    if (!id) {
        throw new AppError("Order id is missing.", 400, "Missing id", false);
    }

    const deletedItems = await deleteAllOrderItemsByOrderIDService(id);
    const deleteOrder = await deleteDataByIDService(id);

    res.status(200).json({
        message: 'Order deleted successfully',
        deleteOrder
    });
});

export const updateOrderStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const status = req.body.status.toUpperCase();

        if (!id) {
            return res.status(400).json({ error: 'Order id is missing.' });
        }

        const updatedOrder = await updateDataByID('order', id, { status });
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.status(204).json({
            message: 'Order updated successfully'.
            updatedOrder
        });
    } catch(error) {
        logger.error(error.message)
        next(error);
    }
}

export const addOrderItems = async (req, res, next) => {
    try {
        const items = res.locals.items;
        const order = res.locals?.order;

        if (!items || items.length === 0) {
            const message = 'Items data is required.';
            logger.error(message);
            return res.status(400).json({ message });
        }

        if (!order) {
            const message = 'Order data is required.';
            logger.error(message);
            return res.status(400).json({ message });
        }

        const orderItems = await Promise.all(
            items.map(async (item) => {
                const product = await getDataByID('product', item.product_id);

                if (!product || product.quantity < item.quantity) {
                    throw new Error(`Insufficient quantity for product ID: ${item.product_id}`);
                }

                const newOrderItem = {
                    order_id: order.id,
                    product_id: product.id,
                    quantity: item.quantity
                };

                return createData('orderItem', newOrderItem);
            })
        );

        next();
    } catch (error) {
        logger.error(error.message || error);
        return next(error);
    }
};
