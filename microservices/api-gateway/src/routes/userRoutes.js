import express from 'express';
import proxy from 'express-http-proxy';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

const USER_SERVICE = process.env.USER_SERVICE_URL;

// ─── Public Routes (không cần token) ────────────────────────────────────────
// Đăng ký, Đăng nhập, Đăng xuất, Refresh Token
// Lưu ý: /auth/refresh phải là PUBLIC vì client không có Access Token khi gọi refresh
router.use('/auth', proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

// ─── Private Routes (cần token) ─────────────────────────────────────────────
// Thông tin cá nhân (user tự xem)
router.use('/users/me', verifyToken, proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/api/users/me${req.url}`
}));

// Quản lý user (chỉ Admin)
router.use('/users', verifyToken, requireAdmin, proxy(USER_SERVICE, {
  proxyReqPathResolver: (req) => `/api/users${req.url}`
}));

export default router;
