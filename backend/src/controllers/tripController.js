import Trip from "../models/Trip.js";
import Route from "../models/Route.js";
import Bus from "../models/Bus.js";
import BusType from "../models/BusType.js";

export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.findAll({
      // Moi luôn cấu trúc Tuyến Đường và Thông tin Xe ra để Frontend vẽ giao diện
      include: [
        { model: Route, as: 'route' },
        { model: Bus, as: 'bus' },
        { model: BusType, as: 'busType' }
      ]
    });
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Lỗi lấy danh sách chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Route, as: 'route' },
        { model: Bus, as: 'bus' },
        { model: BusType, as: 'busType' }
      ]
    });
    if (!trip) return res.status(404).json({ message: "Chuyến đi không tồn tại." });
    return res.status(200).json(trip);
  } catch (error) {
    console.error("Lỗi lấy chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const createTrip = async (req, res) => {
  try {
    const { routeId, busTypeId, busId, departureTime, arrivalTimeExpected, price, status } = req.body;
    
    if (!routeId || !departureTime || !price) {
      return res.status(400).json({ message: "Thiếu thông tin tuyến đường, giờ khởi hành hoặc giá vé." });
    }

    const newTrip = await Trip.create({
      routeId,
      busTypeId,
      busId,
      departureTime,
      arrivalTimeExpected,
      price,
      status: status || 'scheduled'
    });

    return res.status(201).json({ message: "Tạo chuyến đi thành công!", data: newTrip });
  } catch (error) {
    console.error("Lỗi tạo chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const { routeId, busTypeId, busId, departureTime, arrivalTimeExpected, price, status } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ message: "Chuyến không tồn tại." });

    await trip.update({
      routeId,
      busTypeId,
      busId,
      departureTime,
      arrivalTimeExpected,
      price,
      status
    });

    return res.status(200).json({ message: "Cập nhật thành công.", data: trip });
  } catch (error) {
    console.error("Lỗi Cập nhật chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Chuyến không tồn tại." });

    await trip.destroy();
    return res.status(200).json({ message: "Xóa chuyến đi thành công." });
  } catch (error) {
    console.error("Lỗi Xóa chuyến đi:", error);
    return res.status(500).json({ message: "Không thể xóa vì đã có vé được đặt." });
  }
};
