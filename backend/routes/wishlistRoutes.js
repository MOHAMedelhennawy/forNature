import express from 'express';
import { addNewItemToWishlist,
    deleteNewItemFromWishlist,
    getAllWishlistItems,
} from '../controller/whishlistController.js';
import { checkUser } from '../middleware/authMWPermission.js';

const router = express.Router();

router.get('/', checkUser, getAllWishlistItems)
router.post('/', addNewItemToWishlist);
router.delete('/:id', deleteNewItemFromWishlist);

export default router;
