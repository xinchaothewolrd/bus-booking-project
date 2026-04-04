import jwt from "jsonwebtoken"; // Import thư viện jsonwebtoken để tạo và xác thực JWT
import User from "../models/User.js"; // Import model User để truy xuất thông tin người dùng từ database

export const protectedRoute = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Token thường được gửi dưới dạng "Bearer <token value>"
    if (!token) {
      return res.status(401).json({ message: "Access Token không được cung cấp." });
    }
    // xac nhan token hop le
    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, async (err, decodedUser) => {
      if (err) {
        console.error(err);
        return res.status(403).json({ message: "Access Token không hợp lệ hoặc đã hết hạn." });
      }
    // lay user
      const user = await User.findByPk(decodedUser.userId, {
        attributes: { exclude: ["hashedPassword"] }
      }); // Tìm user trong database bằng ID được mã hóa trong token
      if (!user) {
        return res.status(404).json({ message: "User không tồn tại." });
      }
      // logic kiem tra status cua user
      if (user.status === "inactive") {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết." });
      }

      // tra user ve req
      req.user = user;
      next(); // Cho phép tiếp tục xử lý request trong route handler

    });

  } catch (error) {
    console.error("Loi khi xac minh jwt trong authMiddleware:", error);
    return res.status(500).json({ message: "loi he thong" });
  }
};
