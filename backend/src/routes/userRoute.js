import e from 'express';
import express from 'express';
import {
  authMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  updateMe
} from '../controllers/userController.js'; // Import các hàm từ userController
import { protectedRoute, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router(); // Định nghĩa route

router.get('/me', protectedRoute, authMe); //  Định nghĩa route GET /me
router.put('/me', protectedRoute, updateMe); // Cập nhật thông tin cá nhân

// Các API quản lý tài khoản (yêu cầu quyền Admin)
router.get('/', requireAdmin, getAllUsers);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/status', requireAdmin, updateUserStatus);

export default router;