// paymentController.js - Controller quản lý thanh toán
import { VNPay, ignoreLogger } from 'vnpay';
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import TripSeat from "../models/TripSeat.js";
import Trip from "../models/Trip.js";
import { sendTicketEmail } from "../services/emailService.js";
import User from "../models/User.js"; // Import thêm User để lấy email

const VALID_METHODS = ["momo", "zalo_pay", "bank_transfer", "cash", "card"];


const vnpay = new VNPay({
    tmnCode: process.env.vnp_TmnCode,
    secureSecret: process.env.vnp_HashSecret,
    vnpayHost: 'https://sandbox.vnpayment.vn', // Môi trường test Sandbox
    testMode: true, // Bật lên để test
    hashAlgorithm: 'SHA512', // Chuẩn bảo mật mới nhất của VNPay
    enableLog: true, 
    loggerFn: ignoreLogger, 
});

export const createPaymentUrl = (req, res) => {
    try {
        const { bookingId, amount, bankCode } = req.body;
        
        // Lấy IP của khách (VNPay bắt buộc)
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

        // Gọi hàm build link của thư viện
        const urlString = vnpay.buildPaymentUrl({
            vnp_Amount: amount, // 
            vnp_IpAddr: ipAddr,
            vnp_TxnRef: bookingId.toString(), //
            vnp_OrderInfo: `Thanh toan ve xe don hang ${bookingId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: process.env.vnp_ReturnUrl, 
            vnp_Locale: 'vn', // Tiếng Việt
            ...(bankCode && { vnp_BankCode: bankCode })
        });

        return res.status(200).json({ paymentUrl: urlString });

    } catch (error) {
        console.error("Lỗi đẻ link VNPay:", error);
        return res.status(500).json({ message: "Sập nguồn lúc tạo link thanh toán!" });
    }
};

export const vnpayReturn = async (req, res) => {
    try {
        // Hốt trọn chuỗi query param do React gửi lên
        let vnp_Params = req.query;

        // 1. Dùng thư viện xác thực chữ ký (Checksum) chống hacker fake URL
        const isVerified = vnpay.verifyReturnUrl(vnp_Params);
        
        if (!isVerified) {
            console.warn("💥 Phát hiện nghi vấn giả mạo chữ ký VNPay!");
            return res.status(400).json({ 
                success: false, 
                message: "Chữ ký không hợp lệ hoặc dữ liệu bị can thiệp!" 
            });
        }

        const bookingId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];

        // 2. Lấy thông tin thanh toán & Đặt vé ra
        const payment = await Payment.findOne({ where: { bookingId } });
        const booking = await Booking.findByPk(bookingId, {
            include: [
                { model: User, as: "User" },
                { model: Ticket, as: "Tickets", include: [{ model: TripSeat, as: "Seat" }] },
                { model: Trip, as: "Trip" }
            ]
        });

        if (!booking || !payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy đơn đặt vé tương ứng trong hệ thống." 
            });
        }

        // 🔥 NẾU KHÁCH THANH TOÁN THÀNH CÔNG ('00')
        if (responseCode === '00') {
            // Tránh trường hợp React reload 2 lần gọi hàm lại làm gửi mail 2 lần
            if (payment.status !== "success") {
                // Cập nhật trạng thái Payment sang success
                payment.status = "success";
                payment.transactionTime = new Date();
                await payment.save();

                // Chốt đơn DB và update status ghế sang 'booked'
                await _confirmBookingAndSeats(bookingId);
                console.log(booking)
                // 🚀 BẮN EMAIL CHO KHÁCH TẠI ĐÂY
                if (booking.User && booking.User.email) {
                    const seatList = booking.Tickets.map(t => t.Seat?.seatNumber).join(', ');

                    const emailData = {
                        toEmail: booking.User.email,
                        passengerName: booking.Tickets[0]?.passengerName || booking.User.fullName,
                        bookingCode: booking.Tickets[0]?.qrCode || `OB-${booking.id}`,
                        routeName: `Chuyến xe OceanBus #${booking.tripId}`, 
                        departureTime: new Date(booking.Trip?.departureTime).toLocaleString('vi-VN'),
                        seats: seatList,
                        totalAmount: booking.totalAmount
                    };

                    // Bắn mail ngầm
                    sendTicketEmail(emailData);
                }
            }

            // 👉 TRẢ VỀ JSON CHO REACT XỬ LÝ GIAO DIỆN
            return res.status(200).json({ 
                success: true, 
                message: "Thanh toán thành công. Đã chốt vé và gửi email." 
            });

        } else {
            // 💥 NẾU GIAO DỊCH BỊ HỦY / THẤT BẠI
            if (payment.status !== "failed") {
                payment.status = "failed";
                await payment.save();

                booking.status = "cancelled";
                await booking.save();

                // Xả ghế trả lại cho hệ thống
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
            }

            // 👉 TRẢ VỀ JSON BÁO XỊT CHO REACT
            return res.status(200).json({ 
                success: false, 
                message: "Giao dịch không thành công hoặc bị hủy." 
            });
        }

    } catch (error) {
        console.error("Lỗi xử lý API vnpayReturn:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi hệ thống khi xác thực thanh toán!" 
        });
    }
};

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

// POST /api/payments/:id/pay — Giả lập thanh toán (khách tự gọi, hệ thống tự confirm)
// Không cần admin approve, dùng cho môi trường dev/demo
export const mockPayBooking = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: "Thanh toán không tồn tại." });

    if (payment.status === "success") {
      return res.status(400).json({ message: "Đặt vé này đã được thanh toán rồi." });
    }
    if (payment.status === "refunded") {
      return res.status(400).json({ message: "Thanh toán đã được hoàn tiền, không thể thanh toán lại." });
    }
    if (payment.status === "failed") {
      return res.status(400).json({ message: "Thanh toán đã bị từ chối. Vui lòng liên hệ hỗ trợ." });
    }

    const { paymentMethod } = req.body;
    if (paymentMethod && !VALID_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: `Phương thức không hợp lệ. Chọn: ${VALID_METHODS.join(", ")}` });
    }

    // Giả lập xử lý thanh toán (delay 1 giây cho có cảm giác)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Tự động confirm
    payment.status = "success";
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.transactionTime = new Date();
    await payment.save();

    // Cập nhật booking + ghế
    await _confirmBookingAndSeats(payment.bookingId);

    const updated = await Payment.findByPk(payment.id, {
      include: [{ model: Booking, as: "Booking" }],
    });

    return res.status(200).json({
      message: "✅ Thanh toán thành công! Đặt vé đã được xác nhận.",
      data: updated,
    });
  } catch (error) {
    console.error("Error mock paying:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi xử lý thanh toán." });
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
