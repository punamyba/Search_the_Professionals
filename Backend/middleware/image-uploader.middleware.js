import multer, { memoryStorage } from 'multer';
import cloudinary from '../config/cloudinary.config.js';

const storage = memoryStorage();
export const upload = multer({
    storage, 
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: (_req, file, next) => {
        const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
        next (ok ? null: new Error ('Only JPG and PNG allowed'), ok);
    },
});


export function uploadBufferToCloudinary(buffer, options = {}){
    return new Promise ((resolve, reject)=> {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'image', ...options},
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    })
}