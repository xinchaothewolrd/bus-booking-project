import { jest } from "@jest/globals";
jest.mock("../../src/models/RouteStop.js");

import RouteStop from "../../src/models/RouteStop.js";
import {
  getRouteStops,
  getRouteStopById,
  createRouteStop,
  updateRouteStop,
  deleteRouteStop
} from "../../src/controllers/routeStopController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("routeStopController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getRouteStops", () => {
    test("200", async () => {
      RouteStop.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getRouteStops({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteStop.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getRouteStops({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getRouteStopById", () => {
    test("200", async () => {
      RouteStop.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getRouteStopById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404", async () => {
      RouteStop.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getRouteStopById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500", async () => {
      RouteStop.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getRouteStopById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createRouteStop", () => {
    test("400 nếu thiếu", async () => {
      const res = mockRes();
      await createRouteStop({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("201 tạo ok", async () => {
      RouteStop.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createRouteStop({ body: { routeId: 1, stopName: "A", stopOrder: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 lỗi", async () => {
      RouteStop.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createRouteStop({ body: { routeId: 1, stopName: "A", stopOrder: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateRouteStop", () => {
    test("404", async () => {
      RouteStop.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updateRouteStop({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { update: jest.fn().mockResolvedValue() };
      RouteStop.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await updateRouteStop({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteStop.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updateRouteStop({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteRouteStop", () => {
    test("404", async () => {
      RouteStop.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deleteRouteStop({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { destroy: jest.fn().mockResolvedValue() };
      RouteStop.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await deleteRouteStop({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteStop.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deleteRouteStop({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
