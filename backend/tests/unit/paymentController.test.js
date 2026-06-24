// tests/unit/paymentController.test.js
// Unit tests cho paymentController

import { jest } from "@jest/globals";

jest.mock("../../src/models/Payment.js");
jest.mock("../../src/models/Booking.js");
jest.mock("../../src/models/Ticket.js");
jest.mock("../../src/models/TripSeat.js");
jest.mock("../../src/models/Trip.js");

import Payment from "../../src/models/Payment.js";
import Booking from "../../src/models/Booking.js";
import Ticket from "../../src/models/Ticket.js";
import TripSeat from "../../src/models/TripSeat.js";

import {
  getAllPayments,
  createPayment,
  getPaymentById,
  updatePayment,
  approvePayment,
  rejectPayment,
  refundPayment,
  getPaymentByBooking,
  mockPayBooking,
} from "../../src/controllers/paymentController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════
// getAllPayments
// ═══════════════════════════════════════════════════════════════════════════
describe("getAllPayments", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về danh sách payments", async () => {
    Payment.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const req = { query: {} };
    const res = mockRes();
    await getAllPayments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200 filter theo status, paymentMethod, bookingId", async () => {
    Payment.findAll.mockResolvedValue([]);
    const req = { query: { status: "success", paymentMethod: "momo", bookingId: "5" } };
    const res = mockRes();
    await getAllPayments(req, res);
    expect(Payment.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "success", paymentMethod: "momo", bookingId: "5" } })
    );
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findAll.mockRejectedValue(new Error("fail"));
    const res = mockRes();
    await getAllPayments({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// createPayment
// ═══════════════════════════════════════════════════════════════════════════
describe("createPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 nếu thiếu bookingId / amount / paymentMethod", async () => {
    const req = { body: { bookingId: 1 } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { body: { bookingId: 99, amount: 100000, paymentMethod: "cash" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("409 nếu booking đã có payment", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue({ id: 1, bookingId: 1 }); // đã có
    const req = { body: { bookingId: 1, amount: 100000, paymentMethod: "cash" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("400 nếu amount <= 0", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue(null);
    // Truyền amount=-1 để vượt qua validation !amount nhưng vẫn <= 0
    const req = { body: { bookingId: 1, amount: -1, paymentMethod: "cash" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Số tiền phải lớn hơn 0." }));
  });

  test("400 nếu phương thức thanh toán không hợp lệ", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue(null);
    const req = { body: { bookingId: 1, amount: 100000, paymentMethod: "bitcoin" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("không hợp lệ") })
    );
  });

  test("201 tạo payment thành công", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue(null);
    Payment.create.mockResolvedValue({ id: 10 });
    Payment.findByPk.mockResolvedValue({ id: 10, bookingId: 1 });
    const req = { body: { bookingId: 1, amount: 200000, paymentMethod: "momo" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Tạo thanh toán thành công." })
    );
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { body: { bookingId: 1, amount: 100000, paymentMethod: "cash" } };
    const res = mockRes();
    await createPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getPaymentById
// ═══════════════════════════════════════════════════════════════════════════
describe("getPaymentById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về payment nếu tồn tại", async () => {
    Payment.findByPk.mockResolvedValue({ id: 1 });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getPaymentById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await getPaymentById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Thanh toán không tồn tại." });
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getPaymentById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// updatePayment
// ═══════════════════════════════════════════════════════════════════════════
describe("updatePayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValueOnce(null);
    const req = { params: { id: "99" }, body: { status: "success" } };
    const res = mockRes();
    await updatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu chuyển trạng thái không hợp lệ (success → pending)", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "success", save: jest.fn() });
    const req = { params: { id: "1" }, body: { status: "pending" } };
    const res = mockRes();
    await updatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không thể chuyển") })
    );
  });

  test("400 nếu refunded → success (không hợp lệ)", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "refunded", save: jest.fn() });
    const req = { params: { id: "1" }, body: { status: "success" } };
    const res = mockRes();
    await updatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("200 cập nhật pending → success, cập nhật booking+ghế", async () => {
    const mockPayment = {
      id: 1, status: "pending", bookingId: 10,
      save: jest.fn().mockResolvedValue(true),
    };
    // mock cho updatePayment (lần 1 lấy payment, lần 2 lấy lại sau update)
    Payment.findByPk
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({ id: 1, status: "success" });
    // mock _confirmBookingAndSeats nội bộ
    Booking.findByPk.mockResolvedValue({
      id: 10, status: "pending",
      save: jest.fn().mockResolvedValue(true),
      Tickets: [],
    });
    const req = { params: { id: "1" }, body: { status: "success" } };
    const res = mockRes();
    await updatePayment(req, res);
    expect(mockPayment.status).toBe("success");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" }, body: { status: "success" } };
    const res = mockRes();
    await updatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// approvePayment
// ═══════════════════════════════════════════════════════════════════════════
describe("approvePayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValueOnce(null);
    const req = { params: { id: "99" } };
    const res = mockRes();
    await approvePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu status không phải pending", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "success", save: jest.fn() });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await approvePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không thể phê duyệt") })
    );
  });

  test("200 phê duyệt thành công", async () => {
    const mockPayment = { id: 1, status: "pending", bookingId: 10, save: jest.fn().mockResolvedValue(true) };
    Payment.findByPk
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({ id: 1, status: "success" });
    Booking.findByPk.mockResolvedValue({
      id: 10, status: "pending",
      save: jest.fn().mockResolvedValue(true),
      Tickets: [],
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await approvePayment(req, res);
    expect(mockPayment.status).toBe("success");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await approvePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// rejectPayment
// ═══════════════════════════════════════════════════════════════════════════
describe("rejectPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValueOnce(null);
    const res = mockRes();
    await rejectPayment({ params: { id: "99" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu status không phải pending", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "refunded" });
    const res = mockRes();
    await rejectPayment({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("200 từ chối thành công, status → failed", async () => {
    const mockPayment = { id: 1, status: "pending", save: jest.fn().mockResolvedValue(true) };
    Payment.findByPk
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({ id: 1, status: "failed" });
    const res = mockRes();
    await rejectPayment({ params: { id: "1" } }, res);
    expect(mockPayment.status).toBe("failed");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findByPk.mockRejectedValue(new Error("fail"));
    const res = mockRes();
    await rejectPayment({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// refundPayment
// ═══════════════════════════════════════════════════════════════════════════
describe("refundPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValueOnce(null);
    const res = mockRes();
    await refundPayment({ params: { id: "99" } }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu payment status không phải success", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "pending" });
    const res = mockRes();
    await refundPayment({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không thể hoàn tiền") })
    );
  });

  test("200 hoàn tiền thành công, hủy booking + nhả ghế", async () => {
    const mockSeat = { status: "booked", pendingUntil: new Date(), save: jest.fn().mockResolvedValue(true) };
    const mockTicket = { status: "unused", save: jest.fn().mockResolvedValue(true), Seat: mockSeat };
    const mockBooking = {
      id: 10, status: "paid",
      save: jest.fn().mockResolvedValue(true),
      Tickets: [mockTicket],
    };
    const mockPayment = { id: 1, status: "success", bookingId: 10, save: jest.fn().mockResolvedValue(true) };
    Payment.findByPk
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({ id: 1, status: "refunded" });
    Booking.findByPk.mockResolvedValue(mockBooking);

    const res = mockRes();
    await refundPayment({ params: { id: "1" } }, res);
    expect(mockPayment.status).toBe("refunded");
    expect(mockBooking.status).toBe("cancelled");
    expect(mockTicket.status).toBe("cancelled");
    expect(mockSeat.status).toBe("available");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Payment.findByPk.mockRejectedValue(new Error("fail"));
    const res = mockRes();
    await refundPayment({ params: { id: "1" } }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getPaymentByBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("getPaymentByBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { params: { bookingId: "99" } };
    const res = mockRes();
    await getPaymentByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Đặt vé không tồn tại." });
  });

  test("404 nếu payment chưa tồn tại cho booking", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue(null);
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getPaymentByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không tìm thấy") })
    );
  });

  test("200 trả về payment thành công", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    Payment.findOne.mockResolvedValue({ id: 5, bookingId: 1, status: "pending" });
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getPaymentByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getPaymentByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// mockPayBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("mockPayBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu payment không tồn tại", async () => {
    Payment.findByPk.mockResolvedValueOnce(null);
    const res = mockRes();
    await mockPayBooking({ params: { id: "99" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu đã thanh toán (success)", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "success" });
    const res = mockRes();
    await mockPayBooking({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("đã được thanh toán") }));
  });

  test("400 nếu đã hoàn tiền (refunded)", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "refunded" });
    const res = mockRes();
    await mockPayBooking({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 nếu đã bị từ chối (failed)", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "failed" });
    const res = mockRes();
    await mockPayBooking({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("400 nếu phương thức không hợp lệ", async () => {
    Payment.findByPk.mockResolvedValueOnce({ id: 1, status: "pending" });
    const res = mockRes();
    await mockPayBooking({ params: { id: "1" }, body: { paymentMethod: "crypto" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("200 thanh toán mock thành công", async () => {
    const mockPayment = {
      id: 1, status: "pending", bookingId: 10, paymentMethod: "cash",
      save: jest.fn().mockResolvedValue(true),
    };
    // Override setTimeout để bỏ qua delay 1 giây
    jest.spyOn(global, "setTimeout").mockImplementation((fn) => { fn(); return 0; });
    Payment.findByPk
      .mockResolvedValueOnce(mockPayment)
      .mockResolvedValueOnce({ id: 1, status: "success" });
    Booking.findByPk.mockResolvedValue({
      id: 10, status: "pending",
      save: jest.fn().mockResolvedValue(true),
      Tickets: [],
    });
    const req = { params: { id: "1" }, body: { paymentMethod: "momo" } };
    const res = mockRes();
    await mockPayBooking(req, res);
    expect(mockPayment.status).toBe("success");
    expect(res.status).toHaveBeenCalledWith(200);
    jest.restoreAllMocks();
  });

  test("500 nếu DB lỗi", async () => {
    // Payment.findByPk trả về object nhưng save() throw error để trigger catch
    const mockPayment = {
      id: 1, status: "pending", bookingId: 10, paymentMethod: "cash",
      save: jest.fn().mockRejectedValue(new Error("DB save fail")),
    };
    jest.spyOn(global, "setTimeout").mockImplementation((fn) => { fn(); return 0; });
    Payment.findByPk.mockResolvedValueOnce(mockPayment);
    Booking.findByPk.mockResolvedValue({
      id: 10, status: "pending",
      save: jest.fn().mockResolvedValue(true),
      Tickets: [],
    });
    const res = mockRes();
    await mockPayBooking({ params: { id: "1" }, body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
    jest.restoreAllMocks();
  });
});
