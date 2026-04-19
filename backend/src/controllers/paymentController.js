// paymentController.js - Controller quản lý thanh toán

import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import TripSeat from "../models/TripSeat.js";
import Trip from "../models/Trip.js";

const VALID_METHODS = ["momo", "zalo_pay", "bank_transfer", "cash", "card"];

// GET /api/payments — Lấy tất cả payments (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, paymentMethod, bookingId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (bookingId) where.bookingId = bookingId;

    const payments = await Payment.findAll({
      where,
      include: [
        { model: Booking, as: "Booking", attributes: ["id", "userId", "tripId", "status", "totalAmount"] },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error getting payments:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách thanh toán." });
  }
};

// POST /api/payments — Tạo payment mới
export const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ: bookingId, amount, paymentMethod" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    const existingPayment = await Payment.findOne({ where: { bookingId } });
    if (existingPayment) return res.status(409).json({ message: "Đặt vé này đã có thanh toán rồi." });

    if (amount <= 0) return res.status(400).json({ message: "Số tiền phải lớn hơn 0." });

    if (!VALID_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: `Phương thức không hợp lệ. Chọn: ${VALID_METHODS.join(", ")}` });
    }

    const payment = await Payment.create({ bookingId, amount, paymentMethod, status: "pending" });
    const full = await Payment.findByPk(payment.id, { include: [{ model: Booking, as: "Booking" }] });

    return res.status(201).json({ message: "Tạo thanh toán thành công.", data: full });
  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo thanh toán." });
  }
};

// GET /api/payments/:id — Lấy 1 payment
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Booking, as: "Booking", attributes: ["id", "userId", "tripId", "status", "totalAmount"] }],
    });
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });
    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin thanh toán." });
  }
};

// PUT /api/payments/:id — Cập nhật payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionTime } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });

    const validTransitions = {
      pending: ["success", "failed"],
      success: ["refunded"],
      failed: ["pending"],
      refunded: [],
    };

    if (status && (!validTransitions[payment.status] || !validTransitions[payment.status].includes(status))) {
      return res.status(400).json({ message: `Không thể chuyển từ '${payment.status}' sang '${status}'.` });
    }

    if (status) {
      payment.status = status;
      if (status === "success") payment.transactionTime = new Date();
    }
    if (transactionTime && status === "success") {
      payment.transactionTime = new Date(transactionTime);
    }

    await payment.save();

    // Nếu thành công → cập nhật booking + ghế
    if (payment.status === "success") {
      await _confirmBookingAndSeats(payment.bookingId);
    }

    const updated = await Payment.findByPk(id, { include: [{ model: Booking, as: "Booking" }] });
    return res.status(200).json({ message: "Cập nhật thanh toán thành công.", data: updated });
  } catch (error) {
    console.error("Error updating payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật thanh toán." });
  }
};

// POST /api/payments/:id/approve — Phê duyệt payment (Admin)
export const approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });
    if (payment.status !== "pending") {
      return res.status(400).json({ message: `Không thể phê duyệt thanh toán với status '${payment.status}'.` });
    }

    payment.status = "success";
    payment.transactionTime = new Date();
    await payment.save();

    await _confirmBookingAndSeats(payment.bookingId);

    const updated = await Payment.findByPk(payment.id, { include: [{ model: Booking, as: "Booking" }] });
    return res.status(200).json({ message: "Phê duyệt thanh toán thành công.", data: updated });
  } catch (error) {
    console.error("Error approving payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi phê duyệt thanh toán." });
  }
};

// POST /api/payments/:id/reject — Từ chối payment (Admin)
export const rejectPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });
    if (payment.status !== "pending") {
      return res.status(400).json({ message: `Không thể từ chối thanh toán với status '${payment.status}'.` });
    }

    payment.status = "failed";
    await payment.save();

    const updated = await Payment.findByPk(payment.id, { include: [{ model: Booking, as: "Booking" }] });
    return res.status(200).json({ message: "Từ chối thanh toán thành công.", data: updated });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi từ chối thanh toán." });
  }
};

// POST /api/payments/:id/refund — Hoàn tiền (Admin)
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });
    if (payment.status !== "success") {
      return res.status(400).json({ message: `Không thể hoàn tiền với status '${payment.status}'.` });
    }

    const booking = await Booking.findByPk(payment.bookingId, {
      include: [{ model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] }],
    });
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    // Hoàn tiền
    payment.status = "refunded";
    await payment.save();

    // Hủy booking
    booking.status = "cancelled";
    await booking.save();

    // Cập nhật vé thành cancelled + giải phóng ghế
    if (booking.Tickets?.length > 0) {
      await Promise.all(
        booking.Tickets.map(async (ticket) => {
          ticket.status = "cancelled";
          await ticket.save();
          if (ticket.Seat) {
            ticket.Seat.status = "available";
            ticket.Seat.pendingUntil = null;
            await ticket.Seat.save();
          }
        })
      );
    }

    const updated = await Payment.findByPk(payment.id, {
      include: [{ model: Booking, as: "Booking", include: [{ model: Ticket, as: "Tickets" }] }],
    });
    return res.status(200).json({ message: "Hoàn tiền thành công. Ghế đã được giải phóng.", data: updated });
  } catch (error) {
    console.error("Error refunding payment:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi hoàn tiền." });
  }
};

// GET /api/payments/booking/:bookingId — Lấy payment của 1 booking
export const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    const payment = await Payment.findOne({ where: { bookingId } });
    if (!payment) return res.status(404).json({ message: "Không tìm thấy thanh toán cho đặt vé này." });

    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment by booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thanh toán." });
  }
};

// ─── Helper nội bộ ─────────────────────────────────────────────
async function _confirmBookingAndSeats(bookingId) {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] }],
  });
  if (booking && booking.status === "pending") {
    booking.status = "paid";
    await booking.save();

    if (booking.Tickets?.length > 0) {
      await Promise.all(
        booking.Tickets.map((ticket) => {
          if (ticket.Seat) {
            ticket.Seat.status = "booked";
            ticket.Seat.pendingUntil = null;
            return ticket.Seat.save();
          }
        })
      );
    }
  }
}
