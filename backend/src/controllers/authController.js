import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken"; // Import thư viện jsonwebtoken để tạo và xác thực JWT
import crypto from "crypto"; // Import thư viện crypto để tạo refresh token ngẫu nhiên
import Session from "../models/Session.js"; // Import model Session để quản lý refresh token và phiên đăng nhập
const ACCESS_TOKEN_TTL = '30m'; // Thời gian sống của access token, ở đây là 30 phút, bạn có thể điều chỉnh tùy theo nhu cầu của mình
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // Thời gian sống của refresh token, ở đây là 14 ngày (14 ngày * 24 giờ * 60 phút * 60 giây * 1000 ms)



export const signUp = async (req, res) => {
  try {
    const {username, password, email,phone, firstName, lastName } = req.body;
    if (!username || !password || !email || !phone || !firstName || !lastName) {
      return res
      .status(400)
      .json({
        message: "Vui lòng điền đầy đủ thông tin."
      });
    }
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const duplicate = await User.findOne({
      where: {
        username: username,
      }
    });
    if (duplicate) {
      return res
      .status(409)
      .json({
        message: "Username đã tồn tại."
      });
    }
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10); // Số 10 là số lần băm, bạn có thể điều chỉnh tùy theo nhu cầu bảo mật của mình

    // Tạo user mới trong database
    await User.create({
      username,
      hashedPassword,
      email,
      phone,
      displayName: `${firstName} ${lastName}`,
      role: "user", // Mặc định role là "user", bạn có thể thay đổi nếu muốn
      status: "active", // Mặc định status là "active", bạn có thể thay đổi nếu muốn
    });

    // Trả về phản hồi thành công
    return res.sendStatus(204); // 204 No Content, nghĩa là yêu cầu đã thành công nhưng không có nội dung nào để trả về
   }
   catch (error) {
    console.error("Lỗi khi đăng ký:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng ký roi." });
  }
};

export const signIn = async (req, res) => {
  try {
    // lay username va password tu request body, ;ay input tu client gui len
    const { username, password } = req.body;
    if (!username || !password) {
      return res
      .status(400)
      .json({
        message: "Thiếu username hoặc password."
      });
    }
    // tim user trong database theo username
    const user = await User.findOne({
      where: {
        username: username,
      }
    });
    if (!user) {
      return res
      .status(401)
      .json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng."
      });
    }
    if (user.status === "inactive") {
      return res.status(401).json({ message: "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ với quản trị viên để biết thêm chi tiết." });

    }
      // so sanh password tu request voi hashedPassword trong database
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
      .status(401)
      .json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng."
      });
    }
    // neu khop, tao access token
    const accessToken = jwt.sign(
      { userId: user.id,
        role: user.role
      }, // Payload chứa thông tin cần thiết về user, ở đây là userId
      process.env.ACESS_TOKEN_SECRET, // Secret key để ký token, bạn nên lưu trữ nó trong biến môi trường)
      { expiresIn: ACCESS_TOKEN_TTL } // Thời gian hết hạn của token, ở đây là 15 phút, bạn có thể điều chỉnh tùy theo nhu cầu của mình
    );


    // tao refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex'); // Tạo một chuỗi ngẫu nhiên làm refresh token

    // tao session moi de luu refresh token vao database, session de quan ly refresh token
    await Session.create({
      userId: user.id, // Lưu ID của user vào session để sau này có thể xác định được session này thuộc về user nào
      refreshToken, // Lưu refresh token vào session
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL), // Tính toán thời điểm hết hạn của refresh token và lưu vào session
    });

    //tra refresh token ve trong cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // Chỉ cho phép cookie được truy cập thông qua HTTP(S), không cho phép JavaScript truy cập (tăng cường bảo mật)
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS khi ở môi trường production
      sameSite: 'none',  // backend, front end deploy tren 2 domain khac nhau, nen set sameSite: 'none' va secure: true
      maxAge: REFRESH_TOKEN_TTL, // Thời gian sống của cookie, nên trùng với thời gian sống của refresh token
    });

    // tra ve access token trong res
    return res.status(200).json({ message: `User ${user.displayName} đăng nhập thành công.`, accessToken });



  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng nhập." });
  }
};


export const signOut = async (req, res) => {
try {
  // lay refresh token tu cookie
  const token = req.cookies?.refreshToken; //
  // xoa refresh token trong session database
  await Session.destroy({
    where: {
      refreshToken: token
    }
  }); // Xóa session có refresh token trùng với token lấy từ cookie
  // xoa cookie
  res.clearCookie("refreshToken"); // Xóa cookie refreshToken trên trình duyệt của client
  return res.sendStatus(204); // Trả về 204 No Content để cho biết yêu cầu đã thành công nhưng không có nội dung nào để trả về
} catch (error) {
  console.error("Lỗi khi đăng xuất:", error);
  return res.status(500).json({ message: "Đã xảy ra lỗi khi đăng xuất." });
}
};