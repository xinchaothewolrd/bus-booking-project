import BusType from "../models/BusType.js";

// Lấy danh sách tất cả loại xe
export const getAllBusTypes = async (req, res) => {
  try {
    const busTypes = await BusType.findAll();
    return res.status(200).json(busTypes);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại xe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Lấy chi tiết một loại xe bằng ID
export const getBusTypeById = async (req, res) => {
  try {
    const busType = await BusType.findByPk(req.params.id);
    if (!busType) {
      return res.status(404).json({ message: "Không tìm thấy loại xe này." });
    }
    return res.status(200).json(busType);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết loại xe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Tạo một loại xe mới
export const createBusType = async (req, res) => {
  try {
    const { typeName, totalSeats, seatLayout } = req.body;
    if (!typeName || !totalSeats) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên loại xe và tổng số ghế." });
    }

    const newBusType = await BusType.create({ typeName, totalSeats, seatLayout });
    return res.status(201).json({ message: "Tạo loại xe thành công", data: newBusType });
  } catch (error) {
    console.error("Lỗi khi tạo loại xe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi khi tạo loại xe." });
  }
};

// Cập nhật loại xe
export const updateBusType = async (req, res) => {
  try {
    const { typeName, totalSeats, seatLayout } = req.body;
    const busType = await BusType.findByPk(req.params.id);

    if (!busType) {
      return res.status(404).json({ message: "Không tìm thấy loại xe này để cập nhật." });
    }

    await busType.update({ typeName, totalSeats, seatLayout });
    return res.status(200).json({ message: "Cập nhật thành công", data: busType });
  } catch (error) {
    console.error("Lỗi khi cập nhật loại xe:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Xóa một loại xe
export const deleteBusType = async (req, res) => {
  try {
    const busType = await BusType.findByPk(req.params.id);
    if (!busType) {
      return res.status(404).json({ message: "Không tìm thấy loại xe này để xóa." });
    }

    await busType.destroy();
    return res.status(200).json({ message: "Xóa loại xe thành công." });
  } catch (error) {
    console.error("Lỗi khi xóa loại xe:", error);
    // Lưu ý: Nếu loại xe đã được dùng bởi bảng Buses thì MySQL sẽ báo lỗi Foreign Key Constraint
    return res.status(500).json({ message: "Không thể xóa loại xe này vì nó đang tồn tại cùng xe khách." });
  }
};
