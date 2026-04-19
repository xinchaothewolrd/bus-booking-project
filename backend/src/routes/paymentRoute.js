// paymentRoute.js
// Base path: /api/payments

import express from "express";
import {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  approvePayment,
  rejectPayment,
  refundPayment,
  getPaymentByBooking,
} from "../controllers/paymentController.js";
import { protectedRoute, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/payments — Lấy tất cả payments (Admin only)
router.get("/", protectedRoute, requireAdmin, getAllPayments);

// POST /api/payments — Tạo payment mới (Admin)
router.post("/", protectedRoute, requireAdmin, createPayment);

// GET /api/payments/booking/:bookingId — Lấy payment của 1 booking (user đã đăng nhập)
router.get("/booking/:bookingId", protectedRoute, getPaymentByBooking);

// GET /api/payments/:id — Lấy 1 payment (Admin)
router.get("/:id", protectedRoute, requireAdmin, getPaymentById);

// PUT /api/payments/:id — Cập nhật payment (Admin)
router.put("/:id", protectedRoute, requireAdmin, updatePayment);

// POST /api/payments/:id/approve — Phê duyệt payment (Admin)
router.post("/:id/approve", protectedRoute, requireAdmin, approvePayment);

// POST /api/payments/:id/reject — Từ chối payment (Admin)
router.post("/:id/reject", protectedRoute, requireAdmin, rejectPayment);

// POST /api/payments/:id/refund — Hoàn tiền (Admin)
router.post("/:id/refund", protectedRoute, requireAdmin, refundPayment);

export default router;
