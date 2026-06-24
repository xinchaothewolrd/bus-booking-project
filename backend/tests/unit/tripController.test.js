import { jest } from "@jest/globals";

// Mock tất cả models được import trong tripController
jest.mock("../../src/models/Trip.js");
jest.mock("../../src/models/Route.js");
jest.mock("../../src/models/Bus.js");
jest.mock("../../src/models/BusType.js");

import Trip from "../../src/models/Trip.js";
import {
  getAllTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../../src/controllers/tripController.js";

// Helper tạo mock response object
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Dữ liệu mẫu theo cấu trúc thực tế (Trip kèm Route + Bus + BusType) ──
const mockTripFull = {
  id: 1,
  routeId: 2,
  busId: 3,
  departureTime: new Date("2026-12-25T08:00:00"),
  arrivalTimeExpected: new Date("2026-12-25T14:00:00"),
  status: "scheduled",
  cancelPolicy: "Hủy trước 24h hoàn 100%",
  route: { id: 2, name: "Hà Nội – TP.HCM", distance: 1726 },
  bus: {
    id: 3,
    licensePlate: "29A-12345",
    busType: { id: 1, name: "Giường nằm 40 chỗ" },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
describe("tripController", () => {
  beforeEach(() => jest.clearAllMocks());

  // ══════════════════════════ getAllTrips ══════════════════════════
  describe("getAllTrips", () => {
    test("200 – trả về danh sách chuyến xe kèm thông tin tuyến đường và loại xe", async () => {
      Trip.findAll.mockResolvedValue([mockTripFull]);
      const res = mockRes();

      await getAllTrips({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Phải trả về array chứa đầy đủ thông tin route và bus
      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            status: "scheduled",
            route: expect.objectContaining({ name: "Hà Nội – TP.HCM" }),
            bus: expect.objectContaining({ licensePlate: "29A-12345" }),
          }),
        ])
      );
    });

    test("200 – trả về mảng rỗng khi hệ thống chưa có chuyến xe nào", async () => {
      Trip.findAll.mockResolvedValue([]);
      const res = mockRes();

      await getAllTrips({}, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("500 – lỗi hệ thống khi truy vấn DB thất bại", async () => {
      Trip.findAll.mockRejectedValue(new Error("DB connection failed"));
      const res = mockRes();

      await getAllTrips({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ getTripById ══════════════════════════
  describe("getTripById", () => {
    test("200 – tìm thấy chuyến xe với đầy đủ thông tin tuyến và xe", async () => {
      Trip.findByPk.mockResolvedValue(mockTripFull);
      const res = mockRes();

      await getTripById({ params: { id: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          status: "scheduled",
          departureTime: expect.any(Date),
        })
      );
    });

    test("404 – chuyến xe không tồn tại trong hệ thống", async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await getTripById({ params: { id: 9999 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Chuyến đi không tồn tại.",
      });
    });

    test("500 – lỗi hệ thống khi truy vấn DB thất bại", async () => {
      Trip.findByPk.mockRejectedValue(new Error("DB timeout"));
      const res = mockRes();

      await getTripById({ params: { id: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ createTrip ══════════════════════════
  describe("createTrip", () => {
    test("400 – thiếu routeId (trường bắt buộc)", async () => {
      const res = mockRes();

      await createTrip(
        { body: { departureTime: "2026-12-25T08:00:00" } }, // chỉ có departureTime, thiếu routeId
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Thiếu thông tin tuyến đường (routeId) hoặc giờ khởi hành (departureTime).",
      });
    });

    test("400 – thiếu departureTime (trường bắt buộc)", async () => {
      const res = mockRes();

      await createTrip(
        { body: { routeId: 2 } }, // chỉ có routeId, thiếu departureTime
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message:
          "Thiếu thông tin tuyến đường (routeId) hoặc giờ khởi hành (departureTime).",
      });
    });

    test("400 – không truyền body (thiếu tất cả)", async () => {
      const res = mockRes();

      await createTrip({ body: {} }, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("201 – tạo chuyến xe thành công với đầy đủ thông tin", async () => {
      const newTrip = {
        id: 10,
        routeId: 2,
        busId: 3,
        departureTime: "2026-12-25T08:00:00",
        arrivalTimeExpected: "2026-12-25T14:00:00",
        status: "scheduled",
        cancelPolicy: "Hủy trước 24h hoàn 100%",
      };
      Trip.create.mockResolvedValue(newTrip);
      const res = mockRes();

      await createTrip(
        {
          body: {
            routeId: 2,
            busId: 3,
            departureTime: "2026-12-25T08:00:00",
            arrivalTimeExpected: "2026-12-25T14:00:00",
            cancelPolicy: "Hủy trước 24h hoàn 100%",
          },
        },
        res
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo chuyến xe thành công!",
        data: newTrip,
      });
    });

    test("201 – tạo chuyến xe không có busId (xe chưa được phân công)", async () => {
      // Nghiệp vụ: admin tạo chuyến trước, phân xe sau
      const newTrip = {
        id: 11,
        routeId: 1,
        busId: null,
        departureTime: "2026-12-26T06:00:00",
        status: "scheduled",
      };
      Trip.create.mockResolvedValue(newTrip);
      const res = mockRes();

      await createTrip(
        { body: { routeId: 1, departureTime: "2026-12-26T06:00:00" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Tạo chuyến xe thành công!" })
      );
      // busId phải null vì chưa phân công xe
      expect(res.json.mock.calls[0][0].data.busId).toBeNull();
    });

    test("500 – lỗi DB khi tạo chuyến xe", async () => {
      Trip.create.mockRejectedValue(new Error("DB write error"));
      const res = mockRes();

      await createTrip(
        { body: { routeId: 2, departureTime: "2026-12-25T08:00:00" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ updateTrip ══════════════════════════
  describe("updateTrip", () => {
    test("404 – chuyến xe cần cập nhật không tồn tại", async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await updateTrip(
        { params: { id: 999 }, body: { status: "departing" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Chuyến không tồn tại." });
    });

    test("200 – cập nhật trạng thái sang 'departing' khi xe bắt đầu lăn bánh", async () => {
      const mockTrip = {
        id: 1,
        status: "scheduled",
        update: jest.fn().mockResolvedValue({ id: 1, status: "departing" }),
      };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await updateTrip(
        { params: { id: 1 }, body: { status: "departing" } },
        res
      );

      expect(mockTrip.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "departing" })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Cập nhật thành công." })
      );
    });

    test("200 – đánh dấu 'completed' sau khi chuyến xe đã đến nơi", async () => {
      const mockTrip = {
        id: 1,
        status: "departing",
        update: jest.fn().mockResolvedValue({ id: 1, status: "completed" }),
      };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await updateTrip(
        { params: { id: 1 }, body: { status: "completed" } },
        res
      );

      expect(mockTrip.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "completed" })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("200 – phân công xe buýt mới cho chuyến (busId thay đổi)", async () => {
      // Nghiệp vụ: xe cũ hỏng, admin đổi sang xe khác
      const mockTrip = {
        id: 1,
        busId: 3,
        update: jest.fn().mockResolvedValue({ id: 1, busId: 5 }),
      };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await updateTrip({ params: { id: 1 }, body: { busId: 5 } }, res);

      expect(mockTrip.update).toHaveBeenCalledWith(
        expect.objectContaining({ busId: 5 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("200 – hủy chuyến xe (status → 'cancelled')", async () => {
      const mockTrip = {
        id: 1,
        status: "scheduled",
        update: jest.fn().mockResolvedValue({ id: 1, status: "cancelled" }),
      };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await updateTrip(
        { params: { id: 1 }, body: { status: "cancelled" } },
        res
      );

      expect(mockTrip.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: "cancelled" })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("500 – lỗi DB khi cập nhật chuyến xe", async () => {
      Trip.findByPk.mockRejectedValue(new Error("DB connection error"));
      const res = mockRes();

      await updateTrip(
        { params: { id: 1 }, body: { status: "departing" } },
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi hệ thống." });
    });
  });

  // ══════════════════════════ deleteTrip ══════════════════════════
  describe("deleteTrip", () => {
    test("404 – chuyến xe cần xóa không tồn tại", async () => {
      Trip.findByPk.mockResolvedValue(null);
      const res = mockRes();

      await deleteTrip({ params: { id: 999 } }, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Chuyến không tồn tại." });
    });

    test("200 – xóa chuyến xe thành công (chuyến chưa có vé đặt)", async () => {
      const mockTrip = { id: 1, destroy: jest.fn().mockResolvedValue() };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await deleteTrip({ params: { id: 1 } }, res);

      expect(mockTrip.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Xóa chuyến xe thành công.",
      });
    });

    test("500 – không thể xóa chuyến xe đã có vé đặt (DB foreign key constraint)", async () => {
      // Nghiệp vụ: Trip có Booking → cascade delete bị chặn
      const mockTrip = {
        id: 1,
        destroy: jest
          .fn()
          .mockRejectedValue(
            new Error("Cannot delete: foreign key constraint fails")
          ),
      };
      Trip.findByPk.mockResolvedValue(mockTrip);
      const res = mockRes();

      await deleteTrip({ params: { id: 1 } }, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Không thể xóa vì đã có vé được đặt.",
      });
    });
  });
});
