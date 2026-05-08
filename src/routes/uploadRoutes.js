import express from 'express';
const router = express.Router();
import multer from 'multer';
import uploadProductImage from '../cloudinary/ImageController.js';
import injectContext from '../middleware/injectContext.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

// Store file in memory buffer (no temp disk writes)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// POST /api/upload/product/:product_id — admin only
router.post('/product/:product_id', injectContext, requireAdmin, upload.single('image'), uploadProductImage);

export default router;
