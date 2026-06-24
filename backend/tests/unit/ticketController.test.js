// tests/unit/ticketController.test.js
// Unit tests cho ticketController

import { jest } from "@jest/globals";

jest.mock("../../src/models/Ticket.js");
jest.mock("../../src/models/Booking.js");
jest.mock("../../src/models/TripSeat.js");
jest.mock("../../src/models/Trip.js");
jest.mock("../../src/models/Payment.js");

import Ticket from "../../src/models/Ticket.js";
import Booking from "../../src/models/Booking.js";
import TripSeat from "../../src/models/TripSeat.js";

import {
  getAllTickets,
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getTicketsByBooking,
  getTicketByQrCode,
  checkInTicket,
} from "../../src/controllers/ticketController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════
// getAllTickets
// ═══════════════════════════════════════════════════════════════════════════
describe("getAllTickets", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về danh sách tickets", async () => {
    Ticket.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const req = { query: {} };
    const res = mockRes();
    await getAllTickets(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200 filter theo bookingId và tripSeatId", async () => {
    Ticket.findAll.mockResolvedValue([]);
    const req = { query: { bookingId: "3", tripSeatId: "7" } };
    const res = mockRes();
    await getAllTickets(req, res);
    expect(Ticket.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { bookingId: "3", tripSeatId: "7" } })
    );
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findAll.mockRejectedValue(new Error("fail"));
    const res = mockRes();
    await getAllTickets({ query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// createTicket
// ═══════════════════════════════════════════════════════════════════════════
describe("createTicket", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 nếu thiếu bookingId hoặc tripSeatId", async () => {
    const req = { body: { bookingId: 1 } }; // thiếu tripSeatId
    const res = mockRes();
    await createTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("bookingId, tripSeatId") })
    );
  });

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { body: { bookingId: 99, tripSeatId: 1 } };
    const res = mockRes();
    await createTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Đặt vé không tồn tại." });
  });

  test("201 tạo ticket thành công với QR code", async () => {
    Booking.findByPk.mockResolvedValue({ id: 1 });
    const mockTicket = {
      id: 20, qrCode: null,
      save: jest.fn().mockResolvedValue(true),
    };
    Ticket.create.mockResolvedValue(mockTicket);
    Ticket.findByPk.mockResolvedValue({ id: 20, qrCode: "BUS-1-20-..." });
    const req = { body: { bookingId: 1, tripSeatId: 5, passengerName: "Nguyen An", passengerPhone: "0900000000" } };
    const res = mockRes();
    await createTicket(req, res);
    expect(mockTicket.qrCode).toBeTruthy();
    expect(mockTicket.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Tạo vé thành công." }));
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { body: { bookingId: 1, tripSeatId: 1 } };
    const res = mockRes();
    await createTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getTicketById
// ═══════════════════════════════════════════════════════════════════════════
describe("getTicketById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("200 trả về ticket nếu tồn tại", async () => {
    Ticket.findByPk.mockResolvedValue({ id: 1, status: "unused" });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getTicketById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("404 nếu ticket không tồn tại", async () => {
    Ticket.findByPk.mockResolvedValue(null);
    const req = { params: { id: "999" } };
    const res = mockRes();
    await getTicketById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Vé không tồn tại." });
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await getTicketById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// updateTicket
// ═══════════════════════════════════════════════════════════════════════════
describe("updateTicket", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu ticket không tồn tại", async () => {
    Ticket.findByPk.mockResolvedValueOnce(null);
    const req = { params: { id: "99" }, body: { passengerName: "An" } };
    const res = mockRes();
    await updateTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200 cập nhật passengerName và passengerPhone", async () => {
    const mockTicket = {
      id: 1, passengerName: "Cu", passengerPhone: "0900000000",
      save: jest.fn().mockResolvedValue(true),
    };
    Ticket.findByPk
      .mockResolvedValueOnce(mockTicket)
      .mockResolvedValueOnce({ id: 1, passengerName: "Nguyen An" });
    const req = { params: { id: "1" }, body: { passengerName: "Nguyen An", passengerPhone: "0911111111" } };
    const res = mockRes();
    await updateTicket(req, res);
    expect(mockTicket.passengerName).toBe("Nguyen An");
    expect(mockTicket.passengerPhone).toBe("0911111111");
    expect(mockTicket.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("200 chỉ cập nhật một trường (passengerName)", async () => {
    const mockTicket = {
      id: 1, passengerName: "Cu", passengerPhone: "0900000000",
      save: jest.fn().mockResolvedValue(true),
    };
    Ticket.findByPk
      .mockResolvedValueOnce(mockTicket)
      .mockResolvedValueOnce({ id: 1 });
    const req = { params: { id: "1" }, body: { passengerName: "New Name" } };
    const res = mockRes();
    await updateTicket(req, res);
    expect(mockTicket.passengerName).toBe("New Name");
    expect(mockTicket.passengerPhone).toBe("0900000000"); // không thay đổi
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" }, body: {} };
    const res = mockRes();
    await updateTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// deleteTicket
// ═══════════════════════════════════════════════════════════════════════════
describe("deleteTicket", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu ticket không tồn tại", async () => {
    Ticket.findByPk.mockResolvedValue(null);
    const req = { params: { id: "99" } };
    const res = mockRes();
    await deleteTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Vé không tồn tại." });
  });

  test("400 nếu booking của vé không phải pending", async () => {
    Ticket.findByPk.mockResolvedValue({ id: 1, bookingId: 10 });
    Booking.findByPk.mockResolvedValue({ id: 10, status: "paid" });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("paid") })
    );
  });

  test("204 xóa vé thành công khi booking pending", async () => {
    const mockTicket = { id: 1, bookingId: 10, destroy: jest.fn().mockResolvedValue(true) };
    Ticket.findByPk.mockResolvedValue(mockTicket);
    Booking.findByPk.mockResolvedValue({ id: 10, status: "pending" });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteTicket(req, res);
    expect(mockTicket.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getTicketsByBooking
// ═══════════════════════════════════════════════════════════════════════════
describe("getTicketsByBooking", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu booking không tồn tại", async () => {
    Booking.findByPk.mockResolvedValue(null);
    const req = { params: { bookingId: "99" } };
    const res = mockRes();
    await getTicketsByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("200 trả về thông tin vé điện tử đầy đủ", async () => {
    const fakeBooking = {
      id: 1,
      status: "paid",
      totalAmount: 200000,
      createdAt: new Date(),
      Trip: { id: 1, departureTime: new Date(), arrivalTimeExpected: new Date() },
      Payment: { id: 1, paymentMethod: "momo", status: "success", amount: 200000, transactionTime: new Date() },
      Tickets: [
        {
          id: 10,
          passengerName: "Nguyen An",
          passengerPhone: "0900000000",
          qrCode: "ABCDEF",
          status: "unused",
          createdAt: new Date(),
          Seat: { seatNumber: "A1", status: "booked" },
        },
      ],
    };
    Booking.findByPk.mockResolvedValue(fakeBooking);
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getTicketsByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const json = res.json.mock.calls[0][0];
    expect(json.tickets).toHaveLength(1);
    expect(json.tickets[0].qrCode).toBe("ABCDEF");
    expect(json.qrCodeValid).toBe(true);
    expect(json.ticketCount).toBe(1);
  });

  test("200 booking cancelled → qrCodeValid = false", async () => {
    const fakeBooking = {
      id: 1, status: "cancelled", totalAmount: 100000, createdAt: new Date(),
      Trip: null, Payment: null,
      Tickets: [{ id: 10, passengerName: "An", passengerPhone: "0900000000", qrCode: "XYZ", status: "cancelled", createdAt: new Date(), Seat: null }],
    };
    Booking.findByPk.mockResolvedValue(fakeBooking);
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getTicketsByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const json = res.json.mock.calls[0][0];
    expect(json.qrCodeValid).toBe(false);
    expect(json.message).toBe("VÉ ĐÃ HỦY");
  });

  test("500 nếu DB lỗi", async () => {
    Booking.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { bookingId: "1" } };
    const res = mockRes();
    await getTicketsByBooking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// getTicketByQrCode
// ═══════════════════════════════════════════════════════════════════════════
describe("getTicketByQrCode", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu không tìm thấy vé với QR code", async () => {
    Ticket.findOne.mockResolvedValue(null);
    const req = { params: { qrCode: "INVALIDQR" } };
    const res = mockRes();
    await getTicketByQrCode(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không tìm thấy vé") })
    );
  });

  test("200 trả về thông tin vé theo QR code", async () => {
    const fakeTicket = {
      id: 5,
      qrCode: "VALID_QR_001",
      status: "unused",
      passengerName: "Le Van B",
      passengerPhone: "0911111111",
      Seat: { seatNumber: "B3" },
      Booking: {
        id: 1, status: "paid", tripId: 10,
        Trip: { departureTime: new Date(), arrivalTimeExpected: new Date() },
      },
    };
    Ticket.findOne.mockResolvedValue(fakeTicket);
    const req = { params: { qrCode: "VALID_QR_001" } };
    const res = mockRes();
    await getTicketByQrCode(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    const json = res.json.mock.calls[0][0];
    expect(json.ticket.qrCode).toBe("VALID_QR_001");
    expect(json.ticket.seatNumber).toBe("B3");
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findOne.mockRejectedValue(new Error("fail"));
    const req = { params: { qrCode: "ANY" } };
    const res = mockRes();
    await getTicketByQrCode(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// checkInTicket
// ═══════════════════════════════════════════════════════════════════════════
describe("checkInTicket", () => {
  beforeEach(() => jest.clearAllMocks());

  test("404 nếu ticket không tồn tại", async () => {
    Ticket.findByPk.mockResolvedValue(null);
    const req = { params: { id: "99" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Vé không tồn tại." });
  });

  test("400 nếu booking chưa paid", async () => {
    Ticket.findByPk.mockResolvedValue({
      id: 1,
      status: "unused",
      Booking: { status: "pending", Trip: {} },
      Seat: null,
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Không thể check-in") })
    );
  });

  test("400 nếu ticket đã được check-in (used)", async () => {
    Ticket.findByPk.mockResolvedValue({
      id: 1, status: "used",
      passengerName: "Nguyen An",
      Booking: { status: "paid", Trip: {} },
      Seat: null,
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Hành khách đã check-in rồi." })
    );
  });

  test("400 nếu vé đã bị hủy (cancelled)", async () => {
    Ticket.findByPk.mockResolvedValue({
      id: 1, status: "cancelled",
      Booking: { status: "paid", Trip: {} },
      Seat: null,
    });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Vé đã bị hủy, không thể check-in." })
    );
  });

  test("200 check-in thành công, status → used", async () => {
    const mockTicket = {
      id: 1, qrCode: "QR_001", status: "unused",
      passengerName: "Tran Thi C", passengerPhone: "0922222222",
      save: jest.fn().mockResolvedValue(true),
      Booking: { id: 1, status: "paid", Trip: { departureTime: new Date() } },
      Seat: { seatNumber: "C5" },
    };
    Ticket.findByPk.mockResolvedValue(mockTicket);
    const req = { params: { id: "1" }, user: { fullName: "Staff X", role: "staff" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(mockTicket.status).toBe("used");
    expect(mockTicket.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const json = res.json.mock.calls[0][0];
    expect(json.message).toContain("Tran Thi C");
    expect(json.ticket.status).toBe("used");
    expect(json.ticket.checkedInBy).toContain("Staff X");
  });

  test("200 check-in không có req.user (checkedInBy = null)", async () => {
    const mockTicket = {
      id: 1, qrCode: "QR_002", status: "unused",
      passengerName: "Pham D", passengerPhone: "0933333333",
      save: jest.fn().mockResolvedValue(true),
      Booking: { id: 1, status: "paid", Trip: { departureTime: new Date() } },
      Seat: { seatNumber: "D1" },
    };
    Ticket.findByPk.mockResolvedValue(mockTicket);
    const req = { params: { id: "1" } }; // không có req.user
    const res = mockRes();
    await checkInTicket(req, res);
    const json = res.json.mock.calls[0][0];
    expect(json.ticket.checkedInBy).toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("500 nếu DB lỗi", async () => {
    Ticket.findByPk.mockRejectedValue(new Error("fail"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await checkInTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
