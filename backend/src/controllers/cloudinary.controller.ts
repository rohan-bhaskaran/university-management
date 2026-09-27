import type { Request, Response, NextFunction } from 'express';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const uploadImage = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({message: 'No image file provided'});
            return;
        }

        const result = await uploadToCloudinary(req.file.buffer);

        res.status(201).json({message: 'Image uploaded successfully', url: result.url, public_id: result.public_id});
    } catch (err) {
        next(err);
    }
}