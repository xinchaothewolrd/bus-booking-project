// tests/unit/authController.test.js
// Unit tests cho authController (signUp, signIn, signOut, refreshToken)
// Toàn bộ models và libs được mock — không cần database thật

import { jest } from "@jest/globals";

// ─── Mock tất cả dependencies ──────────────────────────────────────────────
jest.mock("../../src/models/User.js");
jest.mock("../../src/models/Session.js");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("crypto");

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../src/models/User.js";
import Session from "../../src/models/Session.js";
import { signUp, signIn, signOut, refreshToken } from "../../src/controllers/authController.js";

// ─── Helper tạo mock req/res ────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

// ═══════════════════════════════════════════════════════════════════════════
// signUp
// ═══════════════════════════════════════════════════════════════════════════
describe("signUp", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 nếu thiếu field bắt buộc", async () => {
    const req = { body: { email: "a@b.com" } };
    const res = mockRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng điền đầy đủ thông tin." });
  });

  test("409 nếu email/phone đã tồn tại", async () => {
    User.findOne.mockResolvedValue({ id: 1, email: "a@b.com" });
    const req = {
      body: { email: "a@b.com", phone: "0900000000", password: "123", firstName: "An", lastName: "Nguyen" },
    };
    const res = mockRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Email hoặc số điện thoại đã tồn tại." });
  });

  test("204 đăng ký thành công", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPwd");
    User.create.mockResolvedValue({});
    const req = {
      body: { email: "new@b.com", phone: "0911111111", password: "123", firstName: "An", lastName: "Nguyen" },
    };
    const res = mockRes();
    await signUp(req, res);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@b.com", role: "customer", status: "active" })
    );
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("500 nếu database lỗi", async () => {
    User.findOne.mockRejectedValue(new Error("DB Error"));
    const req = {
      body: { email: "a@b.com", phone: "0900000000", password: "123", firstName: "An", lastName: "Nguyen" },
    };
    const res = mockRes();
    await signUp(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// signIn
// ═══════════════════════════════════════════════════════════════════════════
describe("signIn", () => {
  beforeEach(() => jest.clearAllMocks());

  test("400 nếu thiếu identity hoặc password", async () => {
    const req = { body: { identity: "a@b.com" } };
    const res = mockRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("401 nếu không tìm thấy user", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { identity: "notexist@b.com", password: "123" } };
    const res = mockRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
  });

  test("401 nếu tài khoản bị banned", async () => {
    User.findOne.mockResolvedValue({ id: 1, status: "banned", hashedPassword: "hash", fullName: "An" });
    const req = { body: { identity: "a@b.com", password: "123" } };
    const res = mockRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("bị khóa") })
    );
  });

  test("401 nếu sai mật khẩu", async () => {
    User.findOne.mockResolvedValue({ id: 1, status: "active", hashedPassword: "hash", fullName: "An" });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { identity: "a@b.com", password: "wrongpwd" } };
    const res = mockRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("200 đăng nhập thành công, trả accessToken + set cookie", async () => {
    const fakeUser = { id: 1, status: "active", hashedPassword: "hash", fullName: "Nguyen An", role: "customer" };
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("access_token_xyz");
    // mock crypto.randomBytes chaining
    const mockBuf = { toString: jest.fn().mockReturnValue("refresh_token_abc") };
    crypto.randomBytes = jest.fn().mockReturnValue(mockBuf);
    Session.create.mockResolvedValue({});

    const req = { body: { identity: "a@b.com", password: "correctpwd" } };
    const res = mockRes();
    await signIn(req, res);

    expect(res.cookie).toHaveBeenCalledWith("refreshToken", "refresh_token_abc", expect.any(Object));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: "access_token_xyz" })
    );
  });

  test("500 nếu database lỗi", async () => {
    User.findOne.mockRejectedValue(new Error("DB fail"));
    const req = { body: { identity: "a@b.com", password: "123" } };
    const res = mockRes();
    await signIn(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// signOut
// ═══════════════════════════════════════════════════════════════════════════
describe("signOut", () => {
  beforeEach(() => jest.clearAllMocks());

  test("204 đăng xuất thành công, xóa cookie", async () => {
    Session.destroy.mockResolvedValue(1);
    const req = { cookies: { refreshToken: "tok_abc" } };
    const res = mockRes();
    await signOut(req, res);
    expect(Session.destroy).toHaveBeenCalledWith({ where: { refreshToken: "tok_abc" } });
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("204 kể cả khi không có cookie (không crash)", async () => {
    Session.destroy.mockResolvedValue(0);
    const req = { cookies: {} };
    const res = mockRes();
    await signOut(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  test("500 nếu database lỗi", async () => {
    Session.destroy.mockRejectedValue(new Error("fail"));
    const req = { cookies: { refreshToken: "tok" } };
    const res = mockRes();
    await signOut(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// refreshToken
// ═══════════════════════════════════════════════════════════════════════════
describe("refreshToken", () => {
  beforeEach(() => jest.clearAllMocks());

  test("401 nếu không có refreshToken trong cookie", async () => {
    const req = { cookies: {} };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("refresh token") })
    );
  });

  test("401 nếu session không tồn tại trong DB", async () => {
    Session.findOne.mockResolvedValue(null);
    const req = { cookies: { refreshToken: "bad_token" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("không hợp lệ") })
    );
  });

  test("401 nếu refreshToken đã hết hạn", async () => {
    const expiredSession = {
      expiresAt: new Date(Date.now() - 1000), // hết hạn 1 giây trước
      destroy: jest.fn().mockResolvedValue(true),
    };
    Session.findOne.mockResolvedValue(expiredSession);
    const req = { cookies: { refreshToken: "expired_token" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(expiredSession.destroy).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("hết hạn") })
    );
  });

  test("401 nếu user trong session không còn tồn tại", async () => {
    Session.findOne.mockResolvedValue({
      userId: 99,
      expiresAt: new Date(Date.now() + 100000),
    });
    User.findByPk.mockResolvedValue(null);
    const req = { cookies: { refreshToken: "valid_token" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("401 nếu user bị banned", async () => {
    Session.findOne.mockResolvedValue({ userId: 1, expiresAt: new Date(Date.now() + 100000) });
    User.findByPk.mockResolvedValue({ id: 1, status: "banned", role: "customer" });
    const req = { cookies: { refreshToken: "valid_token" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("bị khóa") })
    );
  });

  test("200 trả về accessToken mới nếu hợp lệ", async () => {
    Session.findOne.mockResolvedValue({ userId: 1, expiresAt: new Date(Date.now() + 100000) });
    User.findByPk.mockResolvedValue({ id: 1, status: "active", role: "customer" });
    jwt.sign.mockReturnValue("new_access_token");
    const req = { cookies: { refreshToken: "valid_token" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ accessToken: "new_access_token" });
  });

  test("500 nếu lỗi hệ thống", async () => {
    Session.findOne.mockRejectedValue(new Error("DB crash"));
    const req = { cookies: { refreshToken: "tok" } };
    const res = mockRes();
    await refreshToken(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
