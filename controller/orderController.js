import logger from "../utils/logger.js";
import { deleteAllOrderItemsByOrderID, getOrderWithUserInformation } from "../services/orderService.js";
import { createData, deleteDataByID, getAllData, getDataByID, updateDataByID } from "../services/dataService.js";
import { getAllItems } from "../services/cartService.js";


export const getOrderById = async (req, res, next) => {
    try {
        const id = req.params?.id || null;

        const order = await getOrderWithUserInformation(id);
        res.status(200).json(order);
    } catch (error) {
        logger.error(error.message);
        next(error);
    }
}


export const getOrders = async (req, res, next) => {
    try {
        const orders = await getAllData('order');
        
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
}

/**
 * Create new order
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export const addNewOrder = async (req, res, next) => {
    try {
        const cart = res.locals?.cart;
        
        if (!cart) {
            const message = 'Cart data is required.';
            logger.error(message);
            return res.status(400).json({ message });
        }
        
        const items = await getAllItems(cart.id);
        if (!items || items.length === 0) {
            const message = 'Items data is required.';
            logger.error(message);
            return res.status(400).json({ message });
        }

        const { user_id, total_cost } = cart;
        const orderData = { user_id, total_cost };

        const order = await createData('order', orderData);

        res.locals.order = order;
        res.locals.items = items;
        next();
    } catch (error) {
        logger.error(error.message || error);
        return next(error);
    }
};



export const deleteOrder = async (req, res, next) => {
    try {
        const id = req.params.id || null;

        if (!id) {
            return res.status(400).json({error: 'Order id is missing'});
        };

        const deletedItems = await deleteAllOrderItemsByOrderID(id);
        const deleteOrder = await deleteDataByID('order', id);

        if (!deleteOrder) {
            return res.status(404).json({
                error: 'Order not found'
            });
        }

        res.status(200).json({
            message: 'Order deleted successfully',
            deleteOrder
        });
    } catch (error) {
        logger.error(error.message)
        next(error);
    }
}

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

// **** Deling with order items **** //
/**
 * Create order items
 *
 * @param {} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
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
