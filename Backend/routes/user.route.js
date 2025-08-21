// backend/routes/user.route.js
import express from 'express';
import { 
    getUserList,
    searchUsers,
    getUserProfile,
    // Skills functions
    addUserSkill,
    updateUserSkill,
    deleteUserSkill
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

// ===== PUBLIC ROUTES =====
router.get('/list', getUserList);                    // Skills included via populate
router.get('/search', searchUsers);                  // Skills included via populate  
router.get('/profile/:id', getUserProfile);          // Skills included via populate

// ===== PROTECTED ROUTES =====

// Edit profile routes
router.get('/me', authMiddleware, getCurrentUserProfile);
router.patch('/updateProfile', authMiddleware, updateProfile);
router.get('/check-username/:username', authMiddleware, checkUsernameAvailability);

// Profile picture routes
router.patch('/uploadProfilePic', authMiddleware, upload.single('image'), uploadProfilePic);
router.delete("/deleteProfilePic", authMiddleware, deleteProfilePic);

// Skills management routes (all under /api/user/)
router.post('/skills/add', authMiddleware, addUserSkill);
router.put('/skills/update/:skillId', authMiddleware, updateUserSkill);
router.delete('/skills/delete/:skillId', authMiddleware, deleteUserSkill);

export default router;