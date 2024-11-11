import express from 'express';
import { addNewItemToWishlist,
    deleteNewItemFromWishlist,
    getAllWishlistItems,
} from '../controller/whishlistController.js';

const router = express.Router();

router.get('/', getAllWishlistItems)
router.post('/', addNewItemToWishlist);
router.delete('/:id', deleteNewItemFromWishlist);

export default router;
