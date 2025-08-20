// routes/education.route.js
import express from 'express';
import { 
    getUserEducation,
    createEducation,
    updateEducation,
    deleteEducation,
    getEducationById
} from '../controller/education.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/user/education/:userId - Get all education records for a user
router.get('/:userId', getUserEducation);

// POST /api/user/education - Create new education record (for authenticated user)
router.post('/', createEducation);

// GET /api/user/education/single/:educationId - Get single education record by ID
router.get('/single/:educationId', getEducationById);

// PUT /api/user/education/:educationId - Update education record by ID
router.put('/:educationId', updateEducation);

// DELETE /api/user/education/:educationId - Delete education record by ID
router.delete('/:educationId', deleteEducation);

export default router;