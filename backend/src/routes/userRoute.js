import e from 'express';
import express from 'express';
import {
  authMe,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from '../controllers/userController.js'; // Import các hàm từ userController
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router(); // Định nghĩa route

router.get('/me', authMe); //  Định nghĩa route GET /me và gán hàm authMe làm handler (bạn cần định nghĩa hàm authMe trong userController.js)

// Các API quản lý tài khoản (yêu cầu quyền Admin)
router.get('/', requireAdmin, getAllUsers);
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.patch('/:id/status', requireAdmin, updateUserStatus);

export default router;