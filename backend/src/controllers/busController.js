import Bus from "../models/Bus.js";
import BusType from "../models/BusType.js";

// Lấy toàn bộ danh sách xe khách (kèm thông tin loại xe)
export const getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.findAll({
      include: [{ model: BusType, as: 'busType' }] // Moi luôn dữ liệu của bảng Loại Xe lên giao diện
    });
    return res.status(200).json(buses);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách xe khách:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Lấy 1 xe khách theo ID
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findByPk(req.params.id, {
      include: [{ model: BusType, as: 'busType' }]
    });
    if (!bus) return res.status(404).json({ message: "Không tìm thấy xe này." });
    
    return res.status(200).json(bus);
  } catch (error) {
    console.error("Lỗi khi lấy xe khách:", error);
    return res.status(500).json({ message: "Đã xảy ra lỗi hệ thống." });
  }
};

// Thêm xe khách mới
export const createBus = async (req, res) => {
  try {
    const { licensePlate, busTypeId, status, maintenanceNote } = req.body;
    
    if (!licensePlate || !busTypeId) {
      return res.status(400).json({ message: "Biển số và Mã Loại Xe là bắt buộc." });
    }

    // Kiểm tra xem Loại xe này có tồn tại không
    const busTypeExists = await BusType.findByPk(busTypeId);
    if (!busTypeExists) {
      return res.status(404).json({ message: "Mã loại xe (busTypeId) không hợp lệ vì không tồn tại trong hệ thống." });
    }

    const newBus = await Bus.create({
      licensePlate,
      busTypeId,
      status: status || 'active',
      maintenanceNote
    });

    return res.status(201).json({ message: "Nhập xe thành công!", data: newBus });
  } catch (error) {
    console.error("Lỗi khi tạo xe khách:", error);
    return res.status(500).json({ message: "Lỗi tạo xe (Có thể do biển số đã bị trùng)." });
  }
};

// Cập nhật tình trạng xe
export const updateBus = async (req, res) => {
  try {
    const { licensePlate, busTypeId, status, maintenanceNote } = req.body;
    const bus = await Bus.findByPk(req.params.id);

    if (!bus) return res.status(404).json({ message: "Xe không tồn tại." });

    await bus.update({
      licensePlate,
      busTypeId,
      status,
      maintenanceNote
    });

    return res.status(200).json({ message: "Đã cập nhật xe thành công.", data: bus });
  } catch (error) {
    console.error("Lỗi khi update xe khách:", error);
    return res.status(500).json({ message: "Lỗi update (Lưu ý biển số không được trùng xe khác)." });
  }
};

// Xóa xe khách
export const deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByPk(req.params.id);
    if (!bus) return res.status(404).json({ message: "Không tìm thấy xe." });

    await bus.destroy();
    return res.status(200).json({ message: "Xe khách đã được xóa khỏi hệ thống." });
  } catch (error) {
    console.error("Lỗi khi xóa xe khách:", error);
    return res.status(500).json({ message: "Không thể xóa vì xe đang hoạt động trong Chuyến Đi." });
  }
};
