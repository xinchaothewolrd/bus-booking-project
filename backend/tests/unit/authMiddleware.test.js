// tests/unit/authMiddleware.test.js
// Unit tests cho authMiddleware (protectedRoute, requireAdmin, requireStaff)

import { jest } from "@jest/globals";

jest.mock("jsonwebtoken");
jest.mock("../../src/models/User.js");

import jwt from "jsonwebtoken";
import User from "../../src/models/User.js";
import {
  protectedRoute,
  requireAdmin,
  requireStaff,
} from "../../src/middlewares/authMiddleware.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════
// protectedRoute
// ═══════════════════════════════════════════════════════════════════════════
describe("protectedRoute", () => {
  beforeEach(() => jest.clearAllMocks());

  test("401 nếu không có Authorization header", async () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access Token không được cung cấp." });
    expect(next).not.toHaveBeenCalled();
  });

  test("401 nếu Authorization header không có token (Bearer )", async () => {
    const req = { headers: { authorization: "Bearer " } };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("403 nếu token không hợp lệ / hết hạn", async () => {
    jwt.verify.mockImplementation((_tok, _sec, cb) => cb(new Error("invalid"), null));
    const req = { headers: { authorization: "Bearer bad_token" } };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("không hợp lệ") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("404 nếu user trong token không tồn tại", async () => {
    jwt.verify.mockImplementation((_tok, _sec, cb) => cb(null, { userId: 99 }));
    User.findByPk.mockResolvedValue(null);
    const req = { headers: { authorization: "Bearer valid_token" } };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User không tồn tại." });
    expect(next).not.toHaveBeenCalled();
  });

  test("403 nếu user bị banned", async () => {
    jwt.verify.mockImplementation((_tok, _sec, cb) => cb(null, { userId: 1 }));
    User.findByPk.mockResolvedValue({ id: 1, status: "banned" });
    const req = { headers: { authorization: "Bearer valid_token" } };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("bị khóa") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("gọi next() và gán req.user nếu token hợp lệ", async () => {
    const fakeUser = { id: 1, status: "active", role: "customer" };
    jwt.verify.mockImplementation((_tok, _sec, cb) => cb(null, { userId: 1 }));
    User.findByPk.mockResolvedValue(fakeUser);
    const req = { headers: { authorization: "Bearer valid_token" } };
    const res = mockRes();
    const next = jest.fn();
    await protectedRoute(req, res, next);
    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// requireAdmin
// ═══════════════════════════════════════════════════════════════════════════
describe("requireAdmin", () => {
  beforeEach(() => jest.clearAllMocks());

  test("403 nếu không có req.user", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("403 nếu role là customer", () => {
    const req = { user: { id: 1, role: "customer" } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Admin") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("403 nếu role là staff", () => {
    const req = { user: { id: 2, role: "staff" } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("gọi next() nếu role là admin", () => {
    const req = { user: { id: 3, role: "admin" } };
    const res = mockRes();
    const next = jest.fn();
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// requireStaff
// ═══════════════════════════════════════════════════════════════════════════
describe("requireStaff", () => {
  beforeEach(() => jest.clearAllMocks());

  test("403 nếu không có req.user", () => {
    const req = {};
    const res = mockRes();
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("403 nếu role là customer", () => {
    const req = { user: { id: 1, role: "customer" } };
    const res = mockRes();
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Staff") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("gọi next() nếu role là staff", () => {
    const req = { user: { id: 2, role: "staff" } };
    const res = mockRes();
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("gọi next() nếu role là admin", () => {
    const req = { user: { id: 3, role: "admin" } };
    const res = mockRes();
    const next = jest.fn();
    requireStaff(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
