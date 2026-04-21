// ticketController.js - Controller quản lý vé
// Thêm: getTicketByQrCode, checkInTicket (cho Nhân viên phòng vé)

import Ticket from "../models/Ticket.js";
import Booking from "../models/Booking.js";
import TripSeat from "../models/TripSeat.js";
import Trip from "../models/Trip.js";
import Payment from "../models/Payment.js";

// GET /api/tickets — Lấy tất cả tickets (Admin)
export const getAllTickets = async (req, res) => {
  try {
    const { bookingId, tripSeatId } = req.query;
    const where = {};
    if (bookingId) where.bookingId = bookingId;
    if (tripSeatId) where.tripSeatId = tripSeatId;

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: Booking, as: "Booking", attributes: ["id", "userId", "tripId", "status", "totalAmount"] },
        { model: TripSeat, as: "Seat", attributes: ["id", "seatNumber", "status"] },
      ],
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách vé." });
  }
};

// POST /api/tickets — Tạo ticket mới (Admin)
export const createTicket = async (req, res) => {
  try {
    const { bookingId, tripSeatId, passengerName, passengerPhone } = req.body;

    if (!bookingId || !tripSeatId) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ: bookingId, tripSeatId" });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    const ticket = await Ticket.create({
      bookingId, tripSeatId, passengerName, passengerPhone, status: "unused",
    });

    // Gán QR code
    ticket.qrCode = `BUS-${bookingId}-${ticket.id}-${Date.now()}`.toUpperCase();
    await ticket.save();

    const full = await Ticket.findByPk(ticket.id, {
      include: [{ model: Booking, as: "Booking" }],
    });
    return res.status(201).json({ message: "Tạo vé thành công.", data: full });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo vé." });
  }
};

// GET /api/tickets/:id — Lấy 1 vé
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Booking, as: "Booking", attributes: ["id", "userId", "tripId", "status", "totalAmount"] },
        { model: TripSeat, as: "Seat" },
      ],
    });
    if (!ticket) return res.status(404).json({ message: "Vé không tồn tại." });
    return res.status(200).json(ticket);
  } catch (error) {
    console.error("Error getting ticket:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin vé." });
  }
};

// PUT /api/tickets/:id — Cập nhật vé
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { passengerName, passengerPhone } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: "Vé không tồn tại." });

    if (passengerName) ticket.passengerName = passengerName.trim();
    if (passengerPhone) ticket.passengerPhone = passengerPhone.trim();
    await ticket.save();

    const updated = await Ticket.findByPk(id, { include: [{ model: Booking, as: "Booking" }] });
    return res.status(200).json({ message: "Cập nhật vé thành công.", data: updated });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật vé." });
  }
};

// DELETE /api/tickets/:id — Xóa vé (chỉ khi booking pending)
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Vé không tồn tại." });

    const booking = await Booking.findByPk(ticket.bookingId);
    if (booking && booking.status !== "pending") {
      return res.status(400).json({ message: `Không thể xóa vé vì đặt vé có status '${booking.status}'.` });
    }

    await ticket.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi xóa vé." });
  }
};

// GET /api/tickets/booking/:bookingId — Xem vé điện tử của booking
export const getTicketsByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Ticket,
          as: "Tickets",
          include: [{ model: TripSeat, as: "Seat", attributes: ["id", "seatNumber", "status"] }],
        },
        { model: Payment, as: "Payment" },
        { model: Trip, as: "Trip" },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Đặt vé không tồn tại." });

    const isCancelled = booking.status === "cancelled";

    const response = {
      message: isCancelled ? "VÉ ĐÃ HỦY" : "Chi tiết vé điện tử",
      booking: {
        id: booking.id,
        status: booking.status,
        totalAmount: booking.totalAmount,
        createdAt: booking.createdAt,
        tripInfo: booking.Trip
          ? {
              id: booking.Trip.id,
              departureTime: booking.Trip.departureTime,
              arrivalTimeExpected: booking.Trip.arrivalTimeExpected,
            }
          : null,
        payment: booking.Payment
          ? {
              id: booking.Payment.id,
              paymentMethod: booking.Payment.paymentMethod,
              status: booking.Payment.status,
              amount: booking.Payment.amount,
              transactionTime: booking.Payment.transactionTime,
            }
          : null,
      },
      tickets: booking.Tickets.map((ticket) => ({
        id: ticket.id,
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        seatNumber: ticket.Seat?.seatNumber ?? null,
        seatStatus: ticket.Seat?.status ?? null,
        qrCode: ticket.qrCode,
        ticketStatus: ticket.status,
        createdAt: ticket.createdAt,
      })),
      ticketCount: booking.Tickets.length,
      qrCodeValid: !isCancelled,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error getting booking tickets:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy vé của đặt vé." });
  }
};

// ─── CHỨC NĂNG NHÂN VIÊN PHÒNG VÉ ─────────────────────────────────────────

// GET /api/tickets/check/:qrCode — Tìm vé theo QR code (Staff + Admin)
// Nhân viên quét QR → kiểm tra hành khách đã lên xe chưa
export const getTicketByQrCode = async (req, res) => {
  try {
    const { qrCode } = req.params;

    const ticket = await Ticket.findOne({
      where: { qrCode },
      include: [
        {
          model: Booking,
          as: "Booking",
          include: [{ model: Trip, as: "Trip" }],
        },
        { model: TripSeat, as: "Seat", attributes: ["id", "seatNumber", "status"] },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé với mã QR này." });
    }

    return res.status(200).json({
      message: "Tìm vé thành công.",
      ticket: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        status: ticket.status, // unused / used / cancelled
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        seatNumber: ticket.Seat?.seatNumber ?? null,
        booking: {
          id: ticket.Booking?.id,
          status: ticket.Booking?.status,
          tripId: ticket.Booking?.tripId,
          departureTime: ticket.Booking?.Trip?.departureTime,
          arrivalTimeExpected: ticket.Booking?.Trip?.arrivalTimeExpected,
        },
      },
    });
  } catch (error) {
    console.error("Error finding ticket by QR:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tìm vé." });
  }
};

// PATCH /api/tickets/:id/checkin — Check-in hành khách (Staff + Admin)
// Cập nhật ticket status: unused → used
export const checkInTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        {
          model: Booking,
          as: "Booking",
          include: [{ model: Trip, as: "Trip" }],
        },
        { model: TripSeat, as: "Seat" },
      ],
    });

    if (!ticket) return res.status(404).json({ message: "Vé không tồn tại." });

    // Chỉ check-in được nếu booking đã thanh toán
    if (ticket.Booking?.status !== "paid") {
      return res.status(400).json({
        message: `Không thể check-in vì đặt vé có trạng thái '${ticket.Booking?.status}'. Chỉ check-in được vé đã thanh toán.`,
      });
    }

    // Kiểm tra trạng thái vé
    if (ticket.status === "used") {
      return res.status(400).json({
        message: "Hành khách đã check-in rồi.",
        ticket: { id: ticket.id, passengerName: ticket.passengerName, status: ticket.status },
      });
    }

    if (ticket.status === "cancelled") {
      return res.status(400).json({ message: "Vé đã bị hủy, không thể check-in." });
    }

    // Thực hiện check-in
    ticket.status = "used";
    await ticket.save();

    return res.status(200).json({
      message: `✅ Check-in thành công! Hành khách ${ticket.passengerName} đã lên xe.`,
      ticket: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        passengerName: ticket.passengerName,
        passengerPhone: ticket.passengerPhone,
        seatNumber: ticket.Seat?.seatNumber ?? null,
        status: ticket.status,
        booking: {
          id: ticket.Booking?.id,
          departureTime: ticket.Booking?.Trip?.departureTime,
        },
        checkedInBy: req.user ? `${req.user.fullName} (${req.user.role})` : null,
      },
    });
  } catch (error) {
    console.error("Error checking in ticket:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi check-in vé." });
  }
};
