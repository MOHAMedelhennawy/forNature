import { prisma } from '../utils/prismaClient.js';
import { handlePrismaQuery } from '../utils/handlers/handlePrismaQuery.js';

export const getCartItemByIDService = handlePrismaQuery(async (id) => {
    const data = await prisma.cartItems.findUnique({
        where: { id },
        include: { 
            product: {
                select: {
                    price: true,
                }
            }
        }
    });
    
    return data;
});

export const getAllCartItemsService = handlePrismaQuery(async (cart_id) => {
    const data = await prisma.cartItems.findMany({
        where: { cart_id }
    });

    return data;
});

export const getCartTotalCostService = handlePrismaQuery(async (cart_id) => {
    return await prisma.cartItems.aggregate({
        where: { cart_id },
        _sum: { total_price: true },
    });
});

export const addNewItemToCartService = handlePrismaQuery(async (product_id, cart_id, price) => {
    const data = await prisma.cartItems.create({
        data: {
            product_id,
            cart_id,
            unit_price: price,
            total_price: price,
            quantity: 1,
        }
    });

    return data;
});

export const updateCartItemQuantityService = handlePrismaQuery(async (id, quantity, total_price) => {
   return await prisma.cartItems.update({
        where: {id: id},
        data: {
            quantity,
            total_price,
        },
    })
});

export const deleteCartItemByIDService = handlePrismaQuery(async (id) => {
    return await prisma.cartItems.delete({
        where: {
            id,
        }
    });
});

export const deleteAllCartItemsByCartIDService = handlePrismaQuery(async (cart_id) => {
    return await prisma.cartItems.deleteMany({
        where: {
            cart_id
        }
    });
});

export const addItemAndUpdateCartService = handlePrismaQuery(
    async (productId, cartId, price) => {
        return await prisma.$transaction(async (tx) => {
            
            // 1) Add new item
            const newItem = await tx.cartItems.create({
                data: {
                    product_id: productId,
                    cart_id: cartId,
                    unit_price: price,
                    total_price: price,
                    quantity: 1,
                },
            });

            // 2) Update cart total_cost
            await tx.cart.update({
                where: { id: cartId },
                data: {
                    total_cost: {
                        increment: price,
                    },
                },
            });

            return newItem;
        });
    }
);

export const updateCartItemQuantityFullService = handlePrismaQuery(
    async (cartItemId, cartId, quantity, price) => {
        return await prisma.$transaction(async (tx) => {
            const existingItem = await tx.cartItems.findUnique({
                where: { id: cartItemId }
            });

            if (!existingItem || existingItem.cart_id !== cartId) {
                throw new AppError(
                    "Cart item not found.",
                    404,
                    "Cart item not found",
                    false
                );
            }
    
            // Update cart item + its total
            const updatedItem = await tx.cartItems.update({
                where: { id: cartItemId },
                data: {
                    quantity,
                    total_price: quantity * price
                }
            });

            // Get new SUM inside transaction
            const { _sum } = await tx.cartItems.aggregate({
                where: { cart_id: cartId },
                _sum: { total_price: true }
            });

            // Update cart total
            await tx.cart.update({
                where: { id: cartId },
                data: {
                    total_cost: _sum.total_price || 0
                }
            });

            return updatedItem;
        });
    }
);

export const deleteCartItemFullService = handlePrismaQuery(
    async (cartItemId, cartId) => {
        return await prisma.$transaction(async (tx) => {
            
            // 1) Get cart item to delete
            const existingItem = await tx.cartItems.findUnique({
                where: { id: cartItemId }
            });

            if (!existingItem || existingItem.cart_id !== cart.id) {
                throw new AppError("Cart item not found.",
                    404,
                    "Cart item not found",
                    false
                );
            }

            if (existingItem.cart_id !== cartId) {
                throw new AppError(
                    "Cart item does not belong to the specified cart.",
                    400,
                    "Invalid Cart Item",
                    false
                );
            }
            
            const deletedItem = await tx.cartItems.delete({
                where: { id: cartItemId }
            });

            const cartTotalCost = await tx.cartItems.aggregate({
                where: { cart_id: existingItem.cart_id },
                _sum: { total_price: true }
            });

            await tx.cart.update({
                where: { id: existingItem.cart_id },
                data: {
                    total_cost: cartTotalCost._sum.total_price || 0
                }
            });

            return {deletedItem, total: cartTotalCost._sum.total_price || 0};
        });
});