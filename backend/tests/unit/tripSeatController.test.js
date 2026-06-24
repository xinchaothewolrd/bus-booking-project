import { jest } from "@jest/globals";

// Mock models được dùng trong tripSeatController
jest.mock("../../src/models/TripSeat.js");
jest.mock("../../src/models/Trip.js");

import TripSeat from "../../src/models/TripSeat.js";
import {
  getAllTripSeats,
  getTripSeatById,
  getSeatsByTripId,
  createTripSeat,
  updateTripSeat,
  deleteTripSeat,
} from "../../src/controllers/tripSeatController.js";

// Helper tạo mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Dữ liệu ghế mẫu theo TripSeat lifecycle: available → pending → booked ──
const mockSeatAvailable = {
  id: 1,
  tripId: 10,
  seatNumber: "A1",
  status: "available",
  pendingUntil: null,
};

const mockSeatPending = {
  id: 2,
  tripId: 10,
  seatNumber: "A2",
  status: "pending",
  pendingUntil: new Date(Date.now() + 10 * 60 * 1000), // còn 10 phút
};

const mockSeatBooked = {
  id: 3,
  tripId: 10,
  seatNumber: "A3",
  status: "booked",
  pendingUntil: null,
};

// ─────────────────────────────────────────────────────────────────────────────
describe("tripSeatController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════ getAllTripSeats ══════════════════════════
  describe("getAllTripSeats", () => {
    test("200 – trả về toàn bộ ghế trong hệ thống (admin xem tổng quan)", async () => {
      TripSeat.findAll.mockResolvedValue([
        mockSeatAvailable,
        mockSeatPending,
        mockSeatBooked,
      ]);
      const res = mockRes();

      await getAllTripSeats({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data).toHaveLength(3);
      // Phải có ghế ở cả 3 trạng thái trong lifecycle
      expect(data.some((s) => s.status === "available")).toBe(true);
      expect(data.some((s) => s.status === "pending")).toBe(true);
      expect(data.some((s) => s.status === "booked")).toBe(true);
    });

    test("200 – trả về mảng rỗng khi hệ thống chưa có ghế nào", async () => {
      TripSeat.findAll.mockResolvedValue([]);
      const res = mockRes();

      await getAllTripSeats({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("500 – lỗi hệ thống khi truy vấn DB thất bại", async () => {
      TripSeat.findAll.mockRejectedValue(new Error("DB connection failed"));
      const res = mockRes();

      await getAllTripSeats({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ getTripSeatById ══════════════════════════
  describe("getTripSeatById", () => {
    test("200 – tìm thấy ghế theo ID với đầy đủ thông tin", async () => {
      TripSeat.findByPk.mockResolvedValue(mockSeatAvailable);
      const res = mockRes();

      await getTripSeatById({ params: { id: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          seatNumber: "A1",
          status: "available",
          pendingUntil: null,
        })
      );
    });

    test("200 – tìm thấy ghế đang ở trạng thái 'pending' (có pendingUntil)", async () => {
      TripSeat.findByPk.mockResolvedValue(mockSeatPending);
      const res = mockRes();

      await getTripSeatById({ params: { id: 2 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          seatNumber: "A2",
          status: "pending",
          pendingUntil: expect.any(Date),
        })
      );
    });

    test("404 – không tìm thấy ghế với ID không tồn tại", async () => {
      TripSeat.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await getTripSeatById({ params: { id: 9999 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Không tìm thấy thông tin ghế này.",
      });
    });

    test("500 – lỗi hệ thống khi truy vấn DB thất bại", async () => {
      TripSeat.findByPk.mockRejectedValue(new Error("DB timeout"));
      const res = mockRes();

      await getTripSeatById({ params: { id: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════ getSeatsByTripId ══════════════════════
  // API quan trọng nhất: dùng khi user chọn ghế khi đặt vé
  describe("getSeatsByTripId", () => {
    test("200 – trả về danh sách ghế hỗn hợp (available/pending/booked) của chuyến", async () => {
      TripSeat.findAll.mockResolvedValue([
        mockSeatAvailable,
        mockSeatPending,
        mockSeatBooked,
      ]);
      const res = mockRes();

      await getSeatsByTripId({ params: { tripId: 10 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data).toHaveLength(3);
      // Frontend dùng status để tô màu ghế: xanh/vàng/đỏ
      expect(data.find((s) => s.status === "available")?.seatNumber).toBe("A1");
      expect(data.find((s) => s.status === "pending")?.seatNumber).toBe("A2");
      expect(data.find((s) => s.status === "booked")?.seatNumber).toBe("A3");
    });

    test("200 – tất cả ghế đều 'available' (chuyến mới mở bán, chưa ai đặt)", async () => {
      const allAvailable = [
        { id: 1, tripId: 5, seatNumber: "A1", status: "available", pendingUntil: null },
        { id: 2, tripId: 5, seatNumber: "A2", status: "available", pendingUntil: null },
        { id: 3, tripId: 5, seatNumber: "B1", status: "available", pendingUntil: null },
      ];
      TripSeat.findAll.mockResolvedValue(allAvailable);
      const res = mockRes();

      await getSeatsByTripId({ params: { tripId: 5 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data).toHaveLength(3);
      expect(data.every((s) => s.status === "available")).toBe(true);
    });

    test("200 – tất cả ghế đều 'booked' (chuyến hết vé)", async () => {
      const allBooked = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        tripId: 10,
        seatNumber: `A${i + 1}`,
        status: "booked",
        pendingUntil: null,
      }));
      TripSeat.findAll.mockResolvedValue(allBooked);
      const res = mockRes();

      await getSeatsByTripId({ params: { tripId: 10 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0];
      expect(data).toHaveLength(40);
      expect(data.every((s) => s.status === "booked")).toBe(true);
    });

    test("200 – trả về mảng rỗng nếu chuyến xe chưa được tạo ghế", async () => {
      TripSeat.findAll.mockResolvedValue([]);
      const res = mockRes();

      await getSeatsByTripId({ params: { tripId: 99 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("500 – lỗi hệ thống khi truy vấn DB thất bại", async () => {
      TripSeat.findAll.mockRejectedValue(new Error("DB error"));
      const res = mockRes();

      await getSeatsByTripId({ params: { tripId: 10 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ createTripSeat ══════════════════════════
  describe("createTripSeat", () => {
    test("400 – thiếu tripId (trường bắt buộc)", async () => {
      const res = mockRes();

      await createTripSeat({ body: { seatNumber: "A1" } }, res); // thiếu tripId

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cần truyền tên ghế (Ví dụ: A1) và Mã Chuyến Đi.",
      });
    });

    test("400 – thiếu seatNumber (trường bắt buộc)", async () => {
      const res = mockRes();

      await createTripSeat({ body: { tripId: 10 } }, res); // thiếu seatNumber

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cần truyền tên ghế (Ví dụ: A1) và Mã Chuyến Đi.",
      });
    });

    test("400 – không truyền body (thiếu tất cả)", async () => {
      const res = mockRes();

      await createTripSeat({ body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("201 – tạo ghế mới với status mặc định là 'available'", async () => {
      // Nghiệp vụ: khi admin khởi tạo ghế cho chuyến, ghế mặc định là available
      const newSeat = {
        id: 10,
        tripId: 10,
        seatNumber: "B5",
        status: "available",
        pendingUntil: null,
      };
      TripSeat.create.mockResolvedValue(newSeat);
      const res = mockRes();

      await createTripSeat(
        { body: { tripId: 10, seatNumber: "B5" } }, // không truyền status
        res
      );

      // Controller phải tự set status mặc định là 'available'
      expect(TripSeat.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "available" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo dữ liệu ghế thành công!",
        data: newSeat,
      });
    });

    test("201 – tạo ghế với status tường minh 'booked' (admin nhập thủ công vé giấy)", async () => {
      // Nghiệp vụ: admin nhập lại dữ liệu vé giấy cũ vào hệ thống
      const bookedSeat = {
        id: 11,
        tripId: 10,
        seatNumber: "C1",
        status: "booked",
        pendingUntil: null,
      };
      TripSeat.create.mockResolvedValue(bookedSeat);
      const res = mockRes();

      await createTripSeat(
        { body: { tripId: 10, seatNumber: "C1", status: "booked" } },
        res
      );

      expect(TripSeat.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: "booked" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tạo dữ liệu ghế thành công!" })
      );
    });

    test("500 – lỗi DB khi tạo ghế (vi phạm unique tripId+seatNumber)", async () => {
      // Nghiệp vụ: không thể có 2 ghế cùng seatNumber trên cùng chuyến
      TripSeat.create.mockRejectedValue(
        new Error("Unique constraint violation: tripId+seatNumber")
      );
      const res = mockRes();

      await createTripSeat(
        { body: { tripId: 10, seatNumber: "A1" } }, // A1 đã tồn tại
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lỗi cấu tạo ghế ngồi.",
      });
    });
  });

  // ══════════════════════════ updateTripSeat ══════════════════════════
  describe("updateTripSeat", () => {
    test("404 – ghế cần cập nhật không tồn tại", async () => {
      TripSeat.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await updateTripSeat(
        { params: { id: 999 }, body: { status: "pending" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Ghế không tồn tại." });
    });

    test("200 – lock ghế (available → pending) khi user bắt đầu đặt vé, đặt pendingUntil +10 phút", async () => {
      // Nghiệp vụ: khi createBooking gọi → lock ghế 10 phút để user thanh toán
      const pendingUntil = new Date(Date.now() + 10 * 60 * 1000);
      const mockSeat = {
        id: 1,
        seatNumber: "A1",
        status: "available",
        pendingUntil: null,
        update: jest.fn().mockResolvedValue({ id: 1, status: "pending", pendingUntil }),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await updateTripSeat(
        { params: { id: 1 }, body: { status: "pending", pendingUntil } },
        res
      );

      expect(mockSeat.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
          pendingUntil,
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Cập nhật tình trạng ghế thành công.",
        })
      );
    });

    test("200 – xác nhận ghế (pending → booked) khi thanh toán thành công, xóa pendingUntil", async () => {
      // Nghiệp vụ: sau khi payment success → booked, pendingUntil = null
      const mockSeat = {
        id: 2,
        seatNumber: "A2",
        status: "pending",
        pendingUntil: new Date(),
        update: jest.fn().mockResolvedValue({ id: 2, status: "booked", pendingUntil: null }),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await updateTripSeat(
        { params: { id: 2 }, body: { status: "booked", pendingUntil: null } },
        res
      );

      expect(mockSeat.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "booked", pendingUntil: null })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("200 – nhả ghế (pending → available) khi cron job timeout sau 10 phút không thanh toán", async () => {
      // Nghiệp vụ: releaseExpiredSeats cron job chạy mỗi 1 phút
      const mockSeat = {
        id: 2,
        seatNumber: "A2",
        status: "pending",
        pendingUntil: new Date(Date.now() - 1000), // đã hết hạn
        update: jest.fn().mockResolvedValue({ id: 2, status: "available", pendingUntil: null }),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await updateTripSeat(
        {
          params: { id: 2 },
          body: { status: "available", pendingUntil: null },
        },
        res
      );

      expect(mockSeat.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "available", pendingUntil: null })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("200 – nhả ghế (booked → available) khi user hủy vé trước 24h khởi hành", async () => {
      // Nghiệp vụ: cancelBooking → nhả ghế về available để người khác đặt
      const mockSeat = {
        id: 3,
        seatNumber: "A3",
        status: "booked",
        pendingUntil: null,
        update: jest.fn().mockResolvedValue({ id: 3, status: "available", pendingUntil: null }),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await updateTripSeat(
        {
          params: { id: 3 },
          body: { status: "available", pendingUntil: null },
        },
        res
      );

      expect(mockSeat.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "available", pendingUntil: null })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("500 – lỗi DB khi cập nhật trạng thái ghế", async () => {
      TripSeat.findByPk.mockRejectedValue(new Error("DB write error"));
      const res = mockRes();

      await updateTripSeat({ params: { id: 1 }, body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ deleteTripSeat ══════════════════════════
  describe("deleteTripSeat", () => {
    test("404 – ghế cần xóa không tồn tại", async () => {
      TripSeat.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await deleteTripSeat({ params: { id: 999 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Ghế không tồn tại." });
    });

    test("200 – xóa ghế thành công (admin dọn dẹp ghế hỏng)", async () => {
      const mockSeat = {
        id: 1,
        seatNumber: "A1",
        destroy: jest.fn().mockResolvedValue(),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await deleteTripSeat({ params: { id: 1 } }, res);

      expect(mockSeat.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Hủy bỏ dữ liệu ghế thành công.",
      });
    });

    test("500 – lỗi DB khi xóa ghế (ghế đang có ticket liên kết)", async () => {
      // Nghiệp vụ: ghế đang có Ticket → không thể xóa (FK constraint)
      const mockSeat = {
        id: 3,
        seatNumber: "A3",
        status: "booked",
        destroy: jest
          .fn()
          .mockRejectedValue(new Error("FK constraint: tickets references trip_seats")),
      };
      TripSeat.findByPk.mockResolvedValue(mockSeat);
      const res = mockRes();

      await deleteTripSeat({ params: { id: 3 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });
});
