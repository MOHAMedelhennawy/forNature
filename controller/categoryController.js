import { getCategoryAndSubCatgeory } from "../services/categoryService.js";
import logger from "../utils/logger.js";

export const getCategoryWithSubCategories = async (req, res, next) => {
    try {
        const categories = await getCategoryAndSubCatgeory();

        res.status(200).json(categories);
    } catch (error) {
        logger.error(error.message)
        next(error);
    }
}