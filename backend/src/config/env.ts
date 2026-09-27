import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable: ${name}`);
    return value;
};

export const DATABASE_URL = requireEnv('DATABASE_URL');
export const PORT = process.env.PORT || '5000';
export const ARCJET_KEY = requireEnv('ARCJET_KEY');
export const BETTER_AUTH_SECRET = requireEnv('BETTER_AUTH_SECRET');

export const CLOUDINARY_CLOUD_NAME = requireEnv('CLOUDINARY_CLOUD_NAME',);
export const CLOUDINARY_API_KEY = requireEnv('CLOUDINARY_API_KEY',);
export const CLOUDINARY_API_SECRET = requireEnv('CLOUDINARY_API_SECRET',);