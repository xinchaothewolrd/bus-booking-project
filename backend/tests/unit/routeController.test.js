import { jest } from "@jest/globals";
jest.mock("../../src/models/Route.js");

import Route from "../../src/models/Route.js";
import {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} from "../../src/controllers/routeController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("routeController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAllRoutes", () => {
    test("200", async () => {
      Route.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getAllRoutes({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      Route.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getAllRoutes({ query: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getRouteById", () => {
    test("200", async () => {
      Route.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getRouteById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404", async () => {
      Route.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getRouteById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500", async () => {
      Route.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getRouteById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createRoute", () => {
    test("400 nếu thiếu", async () => {
      const res = mockRes();
      await createRoute({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("201 tạo ok", async () => {
      Route.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createRoute({ body: { startLocation: "A", endLocation: "B", distance: 100, estimatedDuration: 120 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 lỗi", async () => {
      Route.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createRoute({ body: { startLocation: "A", endLocation: "B", distance: 100, estimatedDuration: 120 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateRoute", () => {
    test("404", async () => {
      Route.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updateRoute({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { update: jest.fn().mockResolvedValue() };
      Route.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await updateRoute({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      Route.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updateRoute({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteRoute", () => {
    test("404", async () => {
      Route.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deleteRoute({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { destroy: jest.fn().mockResolvedValue() };
      Route.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await deleteRoute({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      Route.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deleteRoute({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
