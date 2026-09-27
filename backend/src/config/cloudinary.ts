import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from './env.js';

// Configuration
cloudinary.config({ 
    cloud_name: CLOUDINARY_CLOUD_NAME, 
    api_key: CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET 
});

export interface CloudinaryUploadResult {
    url: string,
    public_id: string;
}

export const uploadToCloudinary = async (file: string | Buffer,): Promise<CloudinaryUploadResult> => {
    if (Buffer.isBuffer(file)) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!result) {
                        reject(new Error('Cloudinary upload failed'));
                        return;
                    }

                    resolve({
                        url: result.secure_url,
                        public_id: result.public_id,
                    });
                },
            );

            uploadStream.end(file);
        });
    }

    const result = await cloudinary.uploader.upload(file, {
        resource_type: 'auto',
    });

    return {
        url: result.secure_url,
        public_id: result.public_id,
    };
};