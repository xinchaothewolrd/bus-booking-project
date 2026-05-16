import express from 'express';
import { 
  authMe, 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  deleteUser 
} from '../controllers/userController.js';
import { protectedRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', protectedRoute, authMe);
router.get('/', protectedRoute, requireAdmin, getAllUsers);
router.get('/:id', protectedRoute, requireAdmin, getUserById);
router.put('/:id/role', protectedRoute, requireAdmin, updateUserRole);
router.delete('/:id', protectedRoute, requireAdmin, deleteUser);

export default router;