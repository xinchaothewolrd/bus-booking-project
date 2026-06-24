export const authMe = async (req, res) => {
  try {
    const user = req.user; // Lấy thông tin người dùng đã được xác thực từ middleware
    return res.status(200).json({ user }); // Trả về thông tin người dùng trong phản hồi
  } catch (error) {
    console.error("Lỗi khi goi authtMe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy thông tin người dùng." });
  }
};