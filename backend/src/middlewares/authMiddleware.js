import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ─────────────────────────────────────────────
// Middleware 1: protectedRoute
// Xác thực JWT — mọi route cần đăng nhập đều dùng middleware này
// ─────────────────────────────────────────────
export const protectedRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access Token không được cung cấp." });
    }

    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        return res.status(403).json({ message: "Access Token không hợp lệ hoặc đã hết hạn." });
      }

      const user = await User.findByPk(decodedUser.userId, {
        attributes: { exclude: ["hashedPassword"] },
      });
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }
      if (user.status === "banned") {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Lỗi xác minh token:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// ─────────────────────────────────────────────
// Middleware 2: requireAdmin
// Chỉ admin mới được truy cập
// Phải dùng sau protectedRoute
// ─────────────────────────────────────────────
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này. Yêu cầu quyền Admin." });
  }
  next();
};

// ─────────────────────────────────────────────
// Middleware 3: requireStaff
// Admin và Nhân viên phòng vé đều được truy cập
// Phải dùng sau protectedRoute
// ─────────────────────────────────────────────
export const requireStaff = (req, res, next) => {
  if (!req.user || !["admin", "staff"].includes(req.user.role)) {
    return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này. Yêu cầu quyền Staff hoặc Admin." });
  }
  next();
};
