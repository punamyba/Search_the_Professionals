import express from 'express';
import { getUserList, searchUsers, getUserProfile } from '../controller/user.controller.js';
import { uploadProfilePic, deleteProfilePic } from '../controller/profile-picture.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/image-uploader.middleware.js";

const router = express.Router();

router.get('/list', getUserList);
router.get('/search', searchUsers);
router.get('/profile/:id', getUserProfile);

router.patch('/uploadProfilePic', authMiddleware, upload.single('image'), uploadProfilePic);
router.delete("/deleteProfilePic", authMiddleware, deleteProfilePic);

export default router;