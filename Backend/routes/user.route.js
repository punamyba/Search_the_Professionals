// user.route.js
import { Router } from 'express';
import { getUserList, searchUsers, getUserProfile} from '../controller/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';


const router = Router();

router.get("/list", authMiddleware, getUserList);
router.get("/search", authMiddleware, searchUsers); // 🔍 NEW SEARCH ROUTE
router.get('/profile/:userId', authMiddleware, getUserProfile);

export default router;
