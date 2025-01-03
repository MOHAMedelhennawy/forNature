import { createData } from '../services/dataService.js'
import logger from '../utils/logger.js';

export const addNewReview = async (req, res, next) => {
    try {
        const review = req.body.review;
        const rating = parseInt(req.body.rating);
        const product_id = req.body.product_id;
        const user = res.locals.user;

        if (!review) throw new Error("Review text is missing!");

        if (!rating) throw new Error("Rating is missing!");

        if (!product_id) throw new Error('Product id is missing');

        if (!user && !user?.id) throw new Error('User is undefined');

        const data = await createData('review', { user_id: user.id, product_id, review, rating });

        res.status(200).json(data);
    } catch (error) {
        logger.error(error.message)
        next(error);
    }
}