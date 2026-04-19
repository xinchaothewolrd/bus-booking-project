// bookingRoute.js
// Base path: /api/bookings

import express from "express";
import {
  getAllBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protectedRoute, requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/bookings — Lấy tất cả bookings (Admin only)
router.get("/", protectedRoute, requireAdmin, getAllBookings);

// POST /api/bookings — Tạo booking mới (Customer đã đăng nhập)
router.post("/", protectedRoute, createBooking);

// GET /api/bookings/user/:userId — Lấy bookings của 1 user (chính user đó hoặc admin)
router.get("/user/:userId", protectedRoute, getBookingsByUser);

// GET /api/bookings/:id — Lấy 1 booking
router.get("/:id", protectedRoute, getBookingById);

// PUT /api/bookings/:id — Cập nhật booking (Admin)
router.put("/:id", protectedRoute, requireAdmin, updateBooking);

// DELETE /api/bookings/:id — Xóa booking (Admin only)
router.delete("/:id", protectedRoute, requireAdmin, deleteBooking);

// POST /api/bookings/:id/cancel — Hủy booking (chính user đó)
router.post("/:id/cancel", protectedRoute, cancelBooking);

export default router;
