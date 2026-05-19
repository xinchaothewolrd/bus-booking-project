import User from "../models/User.js";
import bcrypt from "bcrypt";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin người dùng đã được xác thực từ middleware
    return res.status(200).json({ user }); // Trả về thông tin người dùng trong phản hồi
  } catch (error) {
    console.error("Lỗi khi goi authtMe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng." });
  }
};

// Lấy danh sách tất cả tài khoản (yêu cầu Admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["hashedPassword"] },
      order: [["id", "DESC"]]
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách người dùng." });
  }
};

// Tạo một tài khoản mới (yêu cầu Admin)
export const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, role, status, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ họ tên, email và mật khẩu." });
    }

    // Kiểm tra trùng lặp email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: "Email đã được sử dụng." });
    }

    // Kiểm tra trùng lặp sđt nếu có
    if (phone) {
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({ message: "Số điện thoại đã được sử dụng." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email,
      phone,
      role: role || "customer",
      status: status || "active",
      hashedPassword
    });

    // Lấy user vừa tạo không kèm password
    const userRes = await User.findByPk(newUser.id, {
      attributes: { exclude: ["hashedPassword"] }
    });

    return res.status(201).json(userRes);
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo người dùng." });
  }
};

// Cập nhật tài khoản (yêu cầu Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, status, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra trùng email (khác id hiện tại)
    if (email && email !== user.email) {
      const duplicateEmail = await User.findOne({ where: { email } });
      if (duplicateEmail) {
        return res.status(409).json({ message: "Email đã được sử dụng bởi người dùng khác." });
      }
    }

    // Kiểm tra trùng sđt (khác id hiện tại)
    if (phone && phone !== user.phone) {
      const duplicatePhone = await User.findOne({ where: { phone } });
      if (duplicatePhone) {
        return res.status(409).json({ message: "Số điện thoại đã được sử dụng bởi người dùng khác." });
      }
    }

    const updateData = {
      fullName: fullName || user.fullName,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      role: role || user.role,
      status: status || user.status
    };

    if (password && password.trim() !== "") {
      updateData.hashedPassword = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    // Trả về user sau khi update
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["hashedPassword"] }
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật người dùng." });
  }
};

// Xóa tài khoản (yêu cầu Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Không cho phép tự xóa chính mình!
    if (req.user.id === Number(id)) {
      return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình." });
    }

    await user.destroy();
    return res.status(200).json({ message: "Xóa tài khoản thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi xóa người dùng." });
  }
};

// Cập nhật trạng thái tài khoản (yêu cầu Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !["active", "banned"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Không cho phép tự khóa chính mình!
    if (req.user.id === Number(id)) {
      return res.status(400).json({ message: "Bạn không thể tự khóa tài khoản của chính mình." });
    }

    await user.update({ status });
    return res.status(200).json({ message: "Cập nhật trạng thái thành công.", status });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái người dùng." });
  }
};