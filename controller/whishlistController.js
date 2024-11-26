import { throws } from "assert";
import { createData, deleteDataByID } from "../services/dataService.js";
import logger from "../utils/logger.js";
import { getWishlistItemByProductIdService, getWishlistItemsByUserId } from "../services/wishlistService.js";

export const addNewItemToWishlist = async (req, res, next) => {
    try {
        const { product_id, user_id } = req.body;
    
        if (!product_id || !user_id) throw new Error('Porduct or user is missing');
    
        const result = await createData('wishlist', req.body);
    
        if (result) {
            res.status(201).json(result);
            logger.info('Item added to wishlist successfully!');
        } else {
            res.status(404).json({ error: 'Falied to add item to wishlist' });
            logger.error('Falied to add item to wishlist')
        }
    } catch (error) {
        next(error);
    }
}

export const getAllWishlistItems = async (req, res, next) => {
    try {
        let wishlistItems;
        const user = res.locals.user;
        const user_id = req.query.userId || null;
        const product_id = req.query.productId || null;

        if (!user) return next();

        if (user_id && product_id) {
            wishlistItems = await getWishlistItemByProductIdService(user.id, product_id);
        } else {
            const user = res.locals.user;

            if (!user.id) res.status(404).json({ error: 'User id is missing' });
    
            wishlistItems = await getWishlistItemsByUserId(user.id);
        }

        return res.status(200).json(wishlistItems);
    } catch (error) {
        logger.error(`Failed to get wihslist items: ${error.message}`);
        next(error);
    }
}

export const deleteNewItemFromWishlist = async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!id) throw new Error('wishlist item id is missing');

        const deletedItem = await deleteDataByID('wishlist', id)
        if (deletedItem) {
            logger.info('deleted successfully');
            res.status(200).json({ deletedItem, message: 'deleted successfully' })
        } else {
            logger.error('Something is wrong');
            res.status(404).json({ error: 'Failed to delete wishlist item' });
        }
    } catch (error) {
        next(error);
    }
}

