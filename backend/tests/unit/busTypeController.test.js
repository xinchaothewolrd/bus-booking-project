import { jest } from "@jest/globals";

jest.mock("../../src/models/BusType.js");

import BusType from "../../src/models/BusType.js";
import {
  getAllBusTypes,
  getBusTypeById,
  createBusType,
  updateBusType,
  deleteBusType
} from "../../src/controllers/busTypeController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("busTypeController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAllBusTypes", () => {
    test("200", async () => {
      BusType.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getAllBusTypes({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      BusType.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getAllBusTypes({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getBusTypeById", () => {
    test("200", async () => {
      BusType.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getBusTypeById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404", async () => {
      BusType.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getBusTypeById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500", async () => {
      BusType.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getBusTypeById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createBusType", () => {
    test("400 nếu thiếu name", async () => {
      const res = mockRes();
      await createBusType({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("201 tạo ok", async () => {
      BusType.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createBusType({ body: { name: "VIP", capacity: 34 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 lỗi", async () => {
      BusType.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createBusType({ body: { name: "VIP" } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateBusType", () => {
    test("404", async () => {
      BusType.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updateBusType({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { update: jest.fn().mockResolvedValue() };
      BusType.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await updateBusType({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      BusType.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updateBusType({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteBusType", () => {
    test("404", async () => {
      BusType.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deleteBusType({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { destroy: jest.fn().mockResolvedValue() };
      BusType.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await deleteBusType({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      BusType.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deleteBusType({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
