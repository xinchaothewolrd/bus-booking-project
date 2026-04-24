// bookingController.js - Controller quản lý đặt vé
import crypto from "crypto";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import Trip from "../models/Trip.js";
import TripSeat from "../models/TripSeat.js";

// Helper: tạo QR code unique cho vé
function generateQrCode(bookingId, ticketId) {
  const raw = `BUS-${bookingId}-${ticketId}-${Date.now()}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 32).toUpperCase();
}

// GET /api/bookings — Lấy tất cả bookings (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const { userId, status, tripId } = req.query;
    const where = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (tripId) where.tripId = tripId;

    const bookings = await Booking.findAll({
      where,
      include: [
        { model: User, as: "User", attributes: ["id", "fullName", "email"] },
        { model: Ticket, as: "Tickets" },
        { model: Payment, as: "Payment" },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Error getting bookings:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách đặt vé." });
  }
};

// POST /api/bookings — Tạo booking mới
// Body: { userId, tripId, totalAmount, tickets: [{tripSeatId, passengerName, passengerPhone}] }
export const createBooking = async (req, res) => {
  try {
    const { userId, tripId, totalAmount, tickets } = req.body;

    if (!userId || !tripId || !totalAmount) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ: userId, tripId, totalAmount" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại." });

    const trip = await Trip.findByPk(tripId);
    if (!trip) return res.status(404).json({ message: "Chuyến xe không tồn tại." });

    const now = new Date();
    if (trip.departureTime <= now) {
      return res.status(400).json({ message: "Chuyến xe này đã khởi hành. Vui lòng chọn chuyến khác." });
    }

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất 1 ghế." });
    }

    const tripSeatIds = tickets.map((t) => t.tripSeatId);
    const tripSeats = await TripSeat.findAll({ where: { id: tripSeatIds, tripId } });

    if (tripSeats.length !== tripSeatIds.length) {
      return res.status(400).json({ message: "Một số ghế không tồn tại hoặc không thuộc chuyến này." });
    }

    const unavailableSeats = tripSeats.filter((s) => s.status !== "available");
    if (unavailableSeats.length > 0) {
      const seatNumbers = unavailableSeats.map((s) => s.seatNumber).join(", ");
      return res.status(409).json({ message: `Ghế ${seatNumbers} không khả dụng. Vui lòng chọn ghế khác.` });
    }

    // Tạo booking
    const booking = await Booking.create({ userId, tripId, totalAmount, status: "pending" });

    // Tạo tickets với QR code unique
    const ticketData = tickets.map((ticket) => ({
      bookingId: booking.id,
      tripSeatId: ticket.tripSeatId,
      passengerName: ticket.passengerName,
      passengerPhone: ticket.passengerPhone,
      status: "unused",
    }));
    const createdTickets = await Ticket.bulkCreate(ticketData, { returning: true });

    // Gán QR code cho từng ticket (cần id nên phải update sau khi create)
    await Promise.all(
      createdTickets.map((t) => {
        t.qrCode = generateQrCode(booking.id, t.id);
        return t.save();
      })
    );

    // Lock ghế 10 phút
    const pendingUntil = new Date(now.getTime() + 10 * 60 * 1000);
    await Promise.all(
      tripSeats.map((seat) => {
        seat.status = "pending";
        seat.pendingUntil = pendingUntil;
        return seat.save();
      })
    );

    // Tạo payment mặc định
    await Payment.create({ bookingId: booking.id, amount: totalAmount, paymentMethod: "cash", status: "pending" });

    const fullBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "fullName", "email"] },
        { model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] },
        { model: Payment, as: "Payment" },
        { model: Trip, as: "Trip" },
      ],
    });

    return res.status(201).json({
      message: "Tạo đặt vé thành công. Quý khách có 10 phút để thanh toán.",
      data: fullBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo đặt vé." });
  }
};

// GET /api/bookings/:id — Lấy 1 booking
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User, as: "User", attributes: ["id", "fullName", "email"] },
        { model: Ticket, as: "Tickets" },
        { model: Payment, as: "Payment" },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });
    return res.status(200).json(booking);
  } catch (error) {
    console.error("Error getting booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin đặt vé." });
  }
};

// PUT /api/bookings/:id — Cập nhật booking (Admin)
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, totalAmount } = req.body;

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    const validTransitions = {
      pending: ["paid", "cancelled"],
      paid: ["cancelled"],
      cancelled: [],
    };

    if (status && (!validTransitions[booking.status] || !validTransitions[booking.status].includes(status))) {
      return res.status(400).json({ message: `Không thể chuyển từ '${booking.status}' sang '${status}'.` });
    }

    if (status) booking.status = status;
    if (totalAmount) booking.totalAmount = totalAmount;
    await booking.save();

    const updated = await Booking.findByPk(id, {
      include: [
        { model: User, as: "User" },
        { model: Ticket, as: "Tickets" },
        { model: Payment, as: "Payment" },
      ],
    });
    return res.status(200).json({ message: "Cập nhật đặt vé thành công.", data: updated });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật đặt vé." });
  }
};

// DELETE /api/bookings/:id — Xóa booking (Admin)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });
    if (booking.status === "paid") {
      return res.status(400).json({ message: "Không thể xóa đặt vé đã thanh toán. Vui lòng hoàn tiền trước." });
    }
    await booking.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi xóa đặt vé." });
  }
};

// GET /api/bookings/user/:userId — Lấy bookings của 1 user (phân loại sắp đi / đã hoàn thành / đã hủy)
export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại." });

    const now = new Date();
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        { model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] },
        { model: Payment, as: "Payment" },
        { model: Trip, as: "Trip" },
      ],
      order: [["created_at", "DESC"]],
    });

    const categorized = { upcoming: [], completed: [], cancelled: [] };
    bookings.forEach((booking) => {
      if (booking.status === "cancelled") {
        categorized.cancelled.push(booking);
      } else if (booking.status === "paid" && booking.Trip?.departureTime > now) {
        categorized.upcoming.push(booking);
      } else if (booking.status === "paid" && booking.Trip?.departureTime <= now) {
        categorized.completed.push(booking);
      }
    });

    categorized.upcoming.sort((a, b) => a.Trip.departureTime - b.Trip.departureTime);
    categorized.completed.sort((a, b) => b.Trip.departureTime - a.Trip.departureTime);

    return res.status(200).json({
      message: bookings.length === 0 ? "Bạn chưa có chuyến đi nào." : "Lấy danh sách chuyến đi thành công.",
      data: categorized,
    });
  } catch (error) {
    console.error("Error getting user bookings:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy đặt vé của user." });
  }
};

// POST /api/bookings/:id/cancel — Hủy booking (user tự hủy, > 24h trước khởi hành)
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id, {
      include: [
        { model: Trip, as: "Trip" },
        { model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] },
        { model: Payment, as: "Payment" },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Đặt vé đã được hủy rồi." });

    const now = new Date();
    const hoursUntilDeparture = (booking.Trip.departureTime - now) / (1000 * 60 * 60);
    if (hoursUntilDeparture < 24) {
      return res.status(400).json({ message: "Đã qua thời gian hủy vé. Vui lòng liên hệ tổng đài nhà xe." });
    }

    booking.status = "cancelled";
    await booking.save();

    // Nhả ghế + hủy vé
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

    // Cập nhật payment nếu đã thanh toán
    if (booking.Payment?.status === "success") {
      booking.Payment.status = "refunded";
      await booking.Payment.save();
    }

    const updated = await Booking.findByPk(id, {
      include: [
        { model: User, as: "User", attributes: ["id", "fullName", "email"] },
        { model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] },
        { model: Payment, as: "Payment" },
        { model: Trip, as: "Trip" },
      ],
    });

    return res.status(200).json({
      message: "Hủy đặt vé thành công. Tiền sẽ được hoàn lại trong 3-5 ngày làm việc.",
      data: updated,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi hủy đặt vé." });
  }
};
