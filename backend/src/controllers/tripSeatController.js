import TripSeat from "../models/TripSeat.js";
import Trip from "../models/Trip.js";

export const getAllTripSeats = async (req, res) => {
  try {
    const seats = await TripSeat.findAll();
    return res.status(200).json(seats);
  } catch (error) {
    console.error("Lỗi lấy danh sách ghế:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const getTripSeatById = async (req, res) => {
  try {
    const seat = await TripSeat.findByPk(req.params.id);
    if (!seat) return res.status(404).json({ message: "Không tìm thấy thông tin ghế này." });
    return res.status(200).json(seat);
  } catch (error) {
    console.error("Lỗi lấy thông tin ghế:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// API chuyên dụng: Lấy tất cả các ghế CỦA MỘT CHUYẾN ĐI CỤ THỂ (Dùng nhiều nhất cho App)
export const getSeatsByTripId = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const seats = await TripSeat.findAll({
      where: { tripId: tripId }
    });
    return res.status(200).json(seats);
  } catch (error) {
    console.error("Lỗi lấy ghế theo chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const createTripSeat = async (req, res) => {
  try {
    const { tripId, seatNumber, status, pendingUntil } = req.body;
    
    if (!tripId || !seatNumber) {
      return res.status(400).json({ message: "Cần truyền tên ghế (Ví dụ: A1) và Mã Chuyến Đi." });
    }

    const newSeat = await TripSeat.create({
      tripId,
      seatNumber,
      status: status || 'available',
      pendingUntil
    });

    return res.status(201).json({ message: "Tạo dữ liệu ghế thành công!", data: newSeat });
  } catch (error) {
    console.error("Lỗi tạo ghế:", error);
    return res.status(500).json({ message: "Lỗi cấu tạo ghế ngồi." });
  }
};

export const updateTripSeat = async (req, res) => {
  try {
    const { tripId, seatNumber, status, pendingUntil } = req.body;
    const seat = await TripSeat.findByPk(req.params.id);

    if (!seat) return res.status(404).json({ message: "Ghế không tồn tại." });

    await seat.update({
      tripId,
      seatNumber,
      status,
      pendingUntil
    });

    return res.status(200).json({ message: "Cập nhật tình trạng ghế thành công.", data: seat });
  } catch (error) {
    console.error("Lỗi cập nhật ghế:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const deleteTripSeat = async (req, res) => {
  try {
    const seat = await TripSeat.findByPk(req.params.id);
    if (!seat) return res.status(404).json({ message: "Ghế không tồn tại." });

    await seat.destroy();
    return res.status(200).json({ message: "Hủy bỏ dữ liệu ghế thành công." });
  } catch (error) {
    console.error("Lỗi xóa ghế:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};
