import { jest } from "@jest/globals";
jest.mock("../../src/models/PriceRule.js");

import PriceRule from "../../src/models/PriceRule.js";
import {
  getAllPriceRules,
  getActivePriceRules,
  getPriceRuleById,
  createPriceRule,
  updatePriceRule,
  deletePriceRule
} from "../../src/controllers/priceRuleController.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("priceRuleController", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("getAllPriceRules", () => {
    test("200", async () => {
      PriceRule.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getAllPriceRules({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      PriceRule.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getAllPriceRules({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getActivePriceRules", () => {
    test("200", async () => {
      PriceRule.findAll.mockResolvedValue([]);
      const res = mockRes();
      await getActivePriceRules({}, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      PriceRule.findAll.mockRejectedValue(new Error());
      const res = mockRes();
      await getActivePriceRules({}, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getPriceRuleById", () => {
    test("200", async () => {
      PriceRule.findByPk.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await getPriceRuleById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("404", async () => {
      PriceRule.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await getPriceRuleById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("500", async () => {
      PriceRule.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await getPriceRuleById({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("createPriceRule", () => {
    test("400 nếu thiếu", async () => {
      const res = mockRes();
      await createPriceRule({ body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
    test("201 tạo ok", async () => {
      PriceRule.create.mockResolvedValue({ id: 1 });
      const res = mockRes();
      await createPriceRule({ body: { name: "rule", type: "fixed", value: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    test("500 lỗi", async () => {
      PriceRule.create.mockRejectedValue(new Error());
      const res = mockRes();
      await createPriceRule({ body: { name: "rule", type: "fixed", value: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("updatePriceRule", () => {
    test("404", async () => {
      PriceRule.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await updatePriceRule({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { update: jest.fn().mockResolvedValue() };
      PriceRule.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await updatePriceRule({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      PriceRule.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await updatePriceRule({ params: { id: 1 }, body: {} }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deletePriceRule", () => {
    test("404", async () => {
      PriceRule.findByPk.mockResolvedValue(null);
      const res = mockRes();
      await deletePriceRule({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
    test("200", async () => {
      const mock = { destroy: jest.fn().mockResolvedValue() };
      PriceRule.findByPk.mockResolvedValue(mock);
      const res = mockRes();
      await deletePriceRule({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });
    test("500", async () => {
      PriceRule.findByPk.mockRejectedValue(new Error());
      const res = mockRes();
      await deletePriceRule({ params: { id: 1 } }, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
