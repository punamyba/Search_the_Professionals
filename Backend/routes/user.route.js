// backend/routes/user.routes.js
import express from 'express';
import { 
    getUserList,
    searchUsers,
    getUserProfile
} from '../controller/user.controller.js';
import { 
    getCurrentUserProfile,
    updateProfile,
    checkUsernameAvailability
} from '../controller/editProfile.controller.js';
import { uploadProfilePic, deleteProfilePic } from '../controller/profile-picture.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/image-uploader.middleware.js";

const router = express.Router();

// Public routes
router.get('/list', getUserList);
router.get('/search', searchUsers);
router.get('/profile/:id', getUserProfile);

// Edit profile routes (protected)
router.get('/me', authMiddleware, getCurrentUserProfile);
router.patch('/updateProfile', authMiddleware, updateProfile);
router.get('/check-username/:username', authMiddleware, checkUsernameAvailability);

// Profile picture routes
router.patch('/uploadProfilePic', authMiddleware, upload.single('image'), uploadProfilePic);
router.delete("/deleteProfilePic", authMiddleware, deleteProfilePic);

export default router;