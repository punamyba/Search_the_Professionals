// profile-picture.controller.js
import User from "../models/user.model.js";
import { uploadBufferToCloudinary } from "../middleware/image-uploader.middleware.js";
import cloudinary from "../config/cloudinary.config.js";

export async function uploadProfilePic(req, res) {
    try {
        if (!req.file) throw new Error('No file uploaded');
        
        const userId = req.user.id; // Your token uses 'id' field
        const user = await User.findById(userId);
        
        if (!user) throw new Error('User not found');

        // Delete old image if exists
        if (user.profilePicture?.public_id) {
            await cloudinary.uploader.destroy(user.profilePicture.public_id);
        }

        // Upload new image
        const result = await uploadBufferToCloudinary(req.file.buffer, {
            folder: 'profilepic',
            public_id: `user_${userId}_${Date.now()}`
        });

        // Update user
        user.profilePicture = {
            url: result.secure_url,
            public_id: result.public_id
        };
        await user.save();

        res.json({ 
            success: true, 
            profilePicture: user.profilePicture 
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
}

export async function deleteProfilePic(req, res) {
    try {
        const userId = req.user.id; // Your token uses 'id' field
        const user = await User.findById(userId);
        
        if (!user || !user.profilePicture?.public_id) {
            throw new Error('No profile picture to delete');
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(user.profilePicture.public_id);

        // Clear from database
        user.profilePicture = { url: '', public_id: '' };
        await user.save();

        res.json({ 
            success: true, 
            message: 'Profile picture deleted' 
        });

    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
}