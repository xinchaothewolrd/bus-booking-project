import { jest } from "@jest/globals";

jest.mock("../../src/models/Bus.js");
jest.mock("../../src/models/BusType.js");

import Bus from "../../src/models/Bus.js";
import BusType from "../../src/models/BusType.js";
import {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
} from "../../src/controllers/busController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("busController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAllBuses", () => {
    test("200 trả về danh sách", async () => {
      Bus.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getAllBuses({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500 nếu DB lỗi", async () => {
      Bus.findAll.mockRejectedValue(new Error("err"));
      const res = mockRes();
      await getAllBuses({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getBusById", () => {
    test("200 nếu tìm thấy", async () => {
      Bus.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getBusById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404 nếu không thấy", async () => {
      Bus.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getBusById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500 nếu lỗi", async () => {
      Bus.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getBusById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createBus", () => {
    test("400 nếu thiếu trường", async () => {
      const res = mockRes();
      await createBus({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("404 nếu busType không có", async () => {
      BusType.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await createBus({ body: { licensePlate: "A", busTypeId: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("201 nếu tạo ok", async () => {
      BusType.findByPk.mockResolvedValue({ id: 1 });
      Bus.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createBus({ body: { licensePlate: "A", busTypeId: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 nếu lỗi", async () => {
      BusType.findByPk.mockResolvedValue({ id: 1 });
      Bus.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createBus({ body: { licensePlate: "A", busTypeId: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateBus", () => {
    test("404 nếu không tìm thấy bus", async () => {
      Bus.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updateBus({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200 nếu update ok", async () => {
      const mockBus = { update: jest.fn().mockResolvedValue() };
      Bus.findByPk.mockResolvedValue(mockBus);
      const res = mockRes();
      await updateBus({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500 nếu lỗi", async () => {
      Bus.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updateBus({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteBus", () => {
    test("404 nếu không tìm thấy", async () => {
      Bus.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deleteBus({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200 nếu xóa ok", async () => {
      const mockBus = { destroy: jest.fn().mockResolvedValue() };
      Bus.findByPk.mockResolvedValue(mockBus);
      const res = mockRes();
      await deleteBus({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500 nếu lỗi", async () => {
      Bus.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deleteBus({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
