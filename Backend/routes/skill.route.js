// backend/routes/skills.routes.js
import express from 'express';
import {
    getUserSkills,
    addSkill,
    updateSkill,
    deleteSkill
} from '../controller/skill.controller.js';
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get skills for a specific user (public)
router.get('/user/:userId', getUserSkills);

// Protected routes (require authentication)
router.post('/add', authMiddleware, addSkill);
router.put('/update/:skillId', authMiddleware, updateSkill);
router.delete('/delete/:skillId', authMiddleware, deleteSkill);

export default router;