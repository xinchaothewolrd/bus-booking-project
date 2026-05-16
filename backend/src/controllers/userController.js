import User from '../models/User.js';

export const authMe = async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin người dùng đã được xác thực từ middleware
    return res.status(200).json({ user }); // Trả về thông tin người dùng trong phản hồi
  } catch (error) {
    console.error("Lỗi khi goi authtMe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng." });
  }
};

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['hashedPassword'] } // Không trả về password
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách user:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// Lấy thông tin chi tiết một người dùng
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['hashedPassword'] }
    });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin user:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// Cập nhật quyền (role) cho người dùng
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ. Phải là 'user' hoặc 'admin'." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({ message: "Cập nhật quyền thành công.", user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    console.error("Lỗi khi cập nhật role user:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};

// Xóa người dùng
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    await user.destroy();
    return res.status(200).json({ message: "Xóa người dùng thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa user:", error);
    return res.status(500).json({ message: "Lỗi server." });
  }
};