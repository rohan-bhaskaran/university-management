import express from 'express';

import { protect } from '../middlewares/arcjet.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';
import { uploadImage } from '../controllers/cloudinary.controller.js';

const router = express.Router();

router.post('/upload', protect, requireAuth(['admin', 'student', 'teacher']), upload.single('image'), uploadImage); // for test seed the image file shdl be named image: blahblah.jpg

export default router;