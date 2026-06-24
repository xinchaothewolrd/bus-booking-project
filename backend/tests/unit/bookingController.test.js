// tests/unit/bookingController.test.js
// Unit tests cho bookingController
// Tất cả models được mock — không cần database thật

import { jest } from "@jest/globals";

jest.mock("../../src/models/Booking.js");
jest.mock("../../src/models/User.js");
jest.mock("../../src/models/Ticket.js");
jest.mock("../../src/models/Payment.js");
jest.mock("../../src/models/Trip.js");
jest.mock("../../src/models/TripSeat.js");

// Mock crypto với đầy đủ chain: createHash().update().digest().slice().toUpperCase()
import crypto from "crypto";
jest.mock("crypto", () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue({
        slice: jest.fn().mockReturnValue({
          toUpperCase: jest.fn().mockReturnValue("MOCKED_QR_CODE_12345678901234"),
        }),
      }),
    }),
  }),
}));

import Booking from "../../src/models/Booking.js";
import User from "../../src/models/User.js";
import Ticket from "../../src/models/Ticket.js";
import Payment from "../../src/models/Payment.js";
import Trip from "../../src/models/Trip.js";
import TripSeat from "../../src/models/TripSeat.js";

import {
  getAllBookings,
  createBooking,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  cancelBooking,
} from "../../src/controllers/bookingController.js";

// ─── Helper ────────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════
// getAllBookings
// ═══════════════════════════════════════════════════════════════════════════
describe("getAllBookings", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về danh sách bookings không có filter", async () => {
    const fakeBookings = [{ id: 1 }, { id: 2 }];
    Booking.findAll.mockResolvedValue(fakeBookings);
    const req = { query: {} };
    const res = mockRes();
    await getAllBookings(req, res);
    expect(Booking.findAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeBookings);
  });

  test("200 filter theo userId, status, tripId", async () => {
    Booking.findAll.mockResolvedValue([]);
    const req = { query: { userId: "5", status: "paid", tripId: "3" } };
    const res = mockRes();
    await getAllBookings(req, res);
    expect(Booking.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "5", status: "paid", tripId: "3" },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findAll.mockRejectedValue(new Error("DB fail"));
    const req = { query: {} };
    const res = mockRes();
    await getAllBookings(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// createBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("createBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 nếu thiếu userId / tripId / totalAmount", async () => {
    const req = { body: { userId: 1, tripId: 2 } }; // thiếu totalAmount
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("userId, tripId, totalAmount") })
    );
  });

  test("404 nếu user không tồn tại", async () => {
    User.findByPk.mockResolvedValue(null);
    const req = { body: { userId: 99, tripId: 1, totalAmount: 100000, tickets: [{ tripSeatId: 1 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User không tồn tại." });
  });

  test("404 nếu trip không tồn tại", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue(null);
    const req = { body: { userId: 1, tripId: 99, totalAmount: 100000, tickets: [{ tripSeatId: 1 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Chuyến xe không tồn tại." });
  });

  test("400 nếu chuyến xe đã khởi hành", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue({ id: 1, departureTime: new Date(Date.now() - 3600000) }); // 1 giờ trước
    const req = { body: { userId: 1, tripId: 1, totalAmount: 100000, tickets: [{ tripSeatId: 1 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("đã khởi hành") })
    );
  });

  test("400 nếu không có danh sách tickets", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue({ id: 1, departureTime: new Date(Date.now() + 3600000) });
    const req = { body: { userId: 1, tripId: 1, totalAmount: 100000, tickets: [] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng chọn ít nhất 1 ghế." });
  });

  test("400 nếu một số ghế không tồn tại hoặc không thuộc chuyến", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue({ id: 1, departureTime: new Date(Date.now() + 3600000) });
    TripSeat.findAll.mockResolvedValue([]); // trả về 0 ghế, nhưng request có 1
    const req = { body: { userId: 1, tripId: 1, totalAmount: 100000, tickets: [{ tripSeatId: 5 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("không tồn tại") })
    );
  });

  test("409 nếu ghế không khả dụng (đang pending/booked)", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue({ id: 1, departureTime: new Date(Date.now() + 3600000) });
    TripSeat.findAll.mockResolvedValue([{ id: 1, status: "pending", seatNumber: "A1" }]);
    const req = { body: { userId: 1, tripId: 1, totalAmount: 100000, tickets: [{ tripSeatId: 1 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("A1") })
    );
  });

  test("201 tạo booking thành công", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Trip.findByPk.mockResolvedValue({ id: 1, departureTime: new Date(Date.now() + 3600000) });
    const mockSeat = { id: 1, status: "available", seatNumber: "A1", pendingUntil: null, save: jest.fn().mockResolvedValue(true) };
    TripSeat.findAll.mockResolvedValue([mockSeat]);
    const mockBooking = { id: 10 };
    Booking.create.mockResolvedValue(mockBooking);
    const mockTicket = { id: 20, qrCode: null, save: jest.fn().mockResolvedValue(true) };
    Ticket.bulkCreate.mockResolvedValue([mockTicket]);
    Payment.create.mockResolvedValue({});
    Booking.findByPk.mockResolvedValue({ id: 10, Tickets: [mockTicket] });

    const req = {
      body: {
        userId: 1, tripId: 1, totalAmount: 200000,
        tickets: [{ tripSeatId: 1, passengerName: "Nguyen An", passengerPhone: "0900000000" }],
      },
    };
    const res = mockRes();
    await createBooking(req, res);
    expect(Booking.create).toHaveBeenCalledWith({ userId: 1, tripId: 1, totalAmount: 200000, status: "pending" });
    expect(mockSeat.status).toBe("pending");
    expect(Payment.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("10 phút") })
    );
  });

  test("500 nếu DB lỗi", async () => {
    User.findByPk.mockRejectedValue(new Error("DB crash"));
    const req = { body: { userId: 1, tripId: 1, totalAmount: 100000, tickets: [{ tripSeatId: 1 }] } };
    const res = mockRes();
    await createBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getBookingById
// ═══════════════════════════════════════════════════════════════════════════
describe("getBookingById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về booking nếu tồn tại", async () => {
    const fake = { id: 1, status: "pending" };
    Booking.findByPk.mockResolvedValue(fake);
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getBookingById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fake);
  });

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await getBookingById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Đặt vé không tồn tại." });
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getBookingById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// updateBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("updateBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValueOnce(null);
    const req = { params: { id: "99" }, body: { status: "paid" } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu chuyển status không hợp lệ (pending → cancelled → paid)", async () => {
    Booking.findByPk.mockResolvedValueOnce({ id: 1, status: "cancelled", save: jest.fn() });
    const req = { params: { id: "1" }, body: { status: "paid" } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không thể chuyển") })
    );
  });

  test("400 nếu status paid → pending (không cho phép)", async () => {
    Booking.findByPk.mockResolvedValueOnce({ id: 1, status: "paid", save: jest.fn() });
    const req = { params: { id: "1" }, body: { status: "pending" } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("200 cập nhật status hợp lệ (pending → paid)", async () => {
    const mockBooking = { id: 1, status: "pending", save: jest.fn().mockResolvedValue(true) };
    Booking.findByPk
      .mockResolvedValueOnce(mockBooking)
      .mockResolvedValueOnce({ id: 1, status: "paid" });
    const req = { params: { id: "1" }, body: { status: "paid" } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(mockBooking.status).toBe("paid");
    expect(mockBooking.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200 cập nhật totalAmount", async () => {
    const mockBooking = { id: 1, status: "pending", totalAmount: 100000, save: jest.fn().mockResolvedValue(true) };
    Booking.findByPk
      .mockResolvedValueOnce(mockBooking)
      .mockResolvedValueOnce({ id: 1 });
    const req = { params: { id: "1" }, body: { totalAmount: 200000 } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(mockBooking.totalAmount).toBe(200000);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" }, body: { status: "paid" } };
    const res = mockRes();
    await updateBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deleteBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("deleteBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { params: { id: "99" } };
    const res = mockRes();
    await deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu booking đã paid (không cho xóa)", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1, status: "paid" });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("đã thanh toán") })
    );
  });

  test("204 xóa booking pending thành công", async () => {
    const mockBooking = { id: 1, status: "pending", destroy: jest.fn().mockResolvedValue(true) };
    Booking.findByPk.mockResolvedValue(mockBooking);
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteBooking(req, res);
    expect(mockBooking.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("204 xóa booking cancelled thành công", async () => {
    const mockBooking = { id: 2, status: "cancelled", destroy: jest.fn().mockResolvedValue(true) };
    Booking.findByPk.mockResolvedValue(mockBooking);
    const req = { params: { id: "2" } };
    const res = mockRes();
    await deleteBooking(req, res);
    expect(mockBooking.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getBookingsByUser
// ═══════════════════════════════════════════════════════════════════════════
describe("getBookingsByUser", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu user không tồn tại", async () => {
    User.findByPk.mockResolvedValue(null);
    const req = { params: { userId: "99" } };
    const res = mockRes();
    await getBookingsByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200 trả về danh sách rỗng khi user chưa có booking", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    Booking.findAll.mockResolvedValue([]);
    const req = { params: { userId: "1" } };
    const res = mockRes();
    await getBookingsByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Bạn chưa có chuyến đi nào." })
    );
  });

  test("200 phân loại đúng upcoming / completed / cancelled", async () => {
    User.findByPk.mockResolvedValue({ id: 1 });
    const now = new Date();
    const upcoming = { status: "paid", Trip: { departureTime: new Date(now.getTime() + 86400000) } };
    const completed = { status: "paid", Trip: { departureTime: new Date(now.getTime() - 86400000) } };
    const cancelled = { status: "cancelled", Trip: { departureTime: new Date(now.getTime() - 86400000) } };
    Booking.findAll.mockResolvedValue([upcoming, completed, cancelled]);
    const req = { params: { userId: "1" } };
    const res = mockRes();
    await getBookingsByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.data.upcoming).toHaveLength(1);
    expect(jsonCall.data.completed).toHaveLength(1);
    expect(jsonCall.data.cancelled).toHaveLength(1);
  });

  test("500 nếu DB lỗi", async () => {
    User.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { userId: "1" } };
    const res = mockRes();
    await getBookingsByUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// cancelBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("cancelBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { params: { id: "99" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("400 nếu booking đã bị hủy trước đó", async () => {
    Booking.findByPk.mockResolvedValue({
      id: 1,
      status: "cancelled",
      Trip: { departureTime: new Date(Date.now() + 86400000 * 2) },
      Tickets: [],
      Payment: null,
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Đặt vé đã được hủy rồi." });
  });

  test("400 nếu còn < 24h đến giờ khởi hành", async () => {
    Booking.findByPk.mockResolvedValue({
      id: 1,
      status: "paid",
      Trip: { departureTime: new Date(Date.now() + 3600000) }, // chỉ còn 1h
      Tickets: [],
      Payment: null,
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("thời gian hủy") })
    );
  });

  test("200 hủy thành công, nhả ghế + hủy vé + hoàn tiền", async () => {
    const mockSeat = { status: "booked", pendingUntil: new Date(), save: jest.fn().mockResolvedValue(true) };
    const mockTicket = { status: "unused", save: jest.fn().mockResolvedValue(true), Seat: mockSeat };
    const mockPayment = { status: "success", save: jest.fn().mockResolvedValue(true) };
    const mockBooking = {
      id: 1,
      status: "paid",
      save: jest.fn().mockResolvedValue(true),
      Trip: { departureTime: new Date(Date.now() + 86400000 * 2) },
      Tickets: [mockTicket],
      Payment: mockPayment,
    };
    Booking.findByPk
      .mockResolvedValueOnce(mockBooking)
      .mockResolvedValueOnce({ id: 1 });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(mockBooking.status).toBe("cancelled");
    expect(mockTicket.status).toBe("cancelled");
    expect(mockSeat.status).toBe("available");
    expect(mockSeat.pendingUntil).toBeNull();
    expect(mockPayment.status).toBe("refunded");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200 hủy booking chưa thanh toán (payment không phải success)", async () => {
    const mockBooking = {
      id: 1,
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
      Trip: { departureTime: new Date(Date.now() + 86400000 * 2) },
      Tickets: [],
      Payment: { status: "pending", save: jest.fn() },
    };
    Booking.findByPk
      .mockResolvedValueOnce(mockBooking)
      .mockResolvedValueOnce({ id: 1 });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(mockBooking.Payment.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await cancelBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
