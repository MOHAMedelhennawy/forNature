import { prisma } from '../utils/prismaClient.js';

export const getWishlistItemsByUserId = async (user_id) => {

    try {
        const wihslistItems = prisma.wishlist.findMany({
            where: {user_id}
        })

        return wihslistItems;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getWishlistItemByProductIdService = async (user_id, product_id) => {
    try {
        const wihslistItem = prisma.wishlist.findFirst({
            where: {
                user_id,
                product_id
            }
        })

        return wihslistItem || null;
    } catch (error) {
        throw new Error(error.message);
    }
}