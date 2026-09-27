import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize : 5 * 1024 *1024 },
    fileFilter: (_req, file, callback) => { //to make sure only img is parsed (image/jpeg , image/png, " "/webp, " "/gif)
        if (file.mimetype.startsWith('image/')) {
            callback(null, true);
            return;
        }
        callback(new Error('Only image files are allowed'));
    },
});

export {upload};