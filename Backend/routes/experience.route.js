// backend/routes/experience.route.js
import express from 'express';
import { 
     getUserExperiences,
     createExperience,
     updateExperience,
     deleteExperience,
     getExperienceById  // Added this
} from '../controller/experience.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/user/experience/:userId - Get all experiences for a user
router.get('/:userId', getUserExperiences);

// POST /api/user/experience - Create new experience (for authenticated user)
router.post('/', createExperience);

// GET /api/user/experience/single/:experienceId - Get single experience by ID
router.get('/single/:experienceId', getExperienceById);

// PUT /api/user/experience/:experienceId - Update experience by ID
router.put('/:experienceId', updateExperience);

// DELETE /api/user/experience/:experienceId - Delete experience by ID
router.delete('/:experienceId', deleteExperience);

export default router;