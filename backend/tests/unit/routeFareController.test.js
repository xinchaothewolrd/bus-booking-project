import { jest } from "@jest/globals";
jest.mock("../../src/models/RouteFare.js");

import RouteFare from "../../src/models/RouteFare.js";
import {
  getAllRouteFares,
  getRouteFareById,
  createRouteFare,
  updateRouteFare,
  deleteRouteFare
} from "../../src/controllers/routeFareController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("routeFareController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAllRouteFares", () => {
    test("200", async () => {
      RouteFare.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getAllRouteFares({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteFare.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getAllRouteFares({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getRouteFareById", () => {
    test("200", async () => {
      RouteFare.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getRouteFareById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404", async () => {
      RouteFare.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getRouteFareById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500", async () => {
      RouteFare.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getRouteFareById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createRouteFare", () => {
    test("400 nếu thiếu", async () => {
      const res = mockRes();
      await createRouteFare({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("201 tạo ok", async () => {
      RouteFare.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createRouteFare({ body: { routeId: 1, busTypeId: 1, baseFare: 100 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 lỗi", async () => {
      RouteFare.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createRouteFare({ body: { routeId: 1, busTypeId: 1, baseFare: 100 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updateRouteFare", () => {
    test("404", async () => {
      RouteFare.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updateRouteFare({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { update: jest.fn().mockResolvedValue() };
      RouteFare.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await updateRouteFare({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteFare.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updateRouteFare({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteRouteFare", () => {
    test("404", async () => {
      RouteFare.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deleteRouteFare({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { destroy: jest.fn().mockResolvedValue() };
      RouteFare.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await deleteRouteFare({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      RouteFare.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deleteRouteFare({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
