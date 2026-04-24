// ticketRoute.js
// Base path: /api/tickets

import express from "express";
import {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketsByBooking,
  getTicketByQrCode,
  checkInTicket,
} from "../controllers/ticketController.js";
import { protectedRoute, requireAdmin, requireStaff } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /api/tickets — Lấy tất cả tickets (Admin only)
router.get("/", protectedRoute, requireAdmin, getAllTickets);

// POST /api/tickets — Tạo ticket mới (Admin)
router.post("/", protectedRoute, requireAdmin, createTicket);

// GET /api/tickets/booking/:bookingId — Lấy vé điện tử của 1 booking (user đã đăng nhập)
router.get("/booking/:bookingId", protectedRoute, getTicketsByBooking);

// ─── STAFF ROUTES (Nhân viên phòng vé) ───────────────────────
// GET /api/tickets/check/:qrCode — Tìm vé theo QR code (staff + admin)
router.get("/check/:qrCode", protectedRoute, requireStaff, getTicketByQrCode);

// PATCH /api/tickets/:id/checkin — Check-in hành khách (staff + admin)
router.patch("/:id/checkin", protectedRoute, requireStaff, checkInTicket);
// ─────────────────────────────────────────────────────────────

// GET /api/tickets/:id — Lấy 1 ticket (admin)
router.get("/:id", protectedRoute, requireAdmin, getTicketById);

// PUT /api/tickets/:id — Cập nhật ticket (admin)
router.put("/:id", protectedRoute, requireAdmin, updateTicket);

// DELETE /api/tickets/:id — Xóa ticket (admin)
router.delete("/:id", protectedRoute, requireAdmin, deleteTicket);

export default router;
