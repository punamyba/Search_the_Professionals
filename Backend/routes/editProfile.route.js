// backend/routes/edit.routes.js
import express from 'express';
import {
    getCurrentUserProfile,
    updateProfile,
    checkUsernameAvailability
} from '../controller/editProfile.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get current user profile for editing
router.get('/profile/:id', getCurrentUserProfile);

// Update user profile
router.patch('/updateProfile', updateProfile);

// Check username availability
router.get('/check-username/:username', checkUsernameAvailability);

export default router;