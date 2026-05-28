import TripSeat from "../models/TripSeat.js";
import Trip from "../models/Trip.js";
import sequelize from "../libs/db.js";

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

export const holdSeats = async (req, res) => {
  // 🔥 Đổi const thành let để có thể gán lại giá trị
  let { tripId, seatNumbers } = req.body;

  // 🔥 BẢO KÊ: Nếu thằng Frontend lỡ gửi chuỗi "A3" thay vì mảng ["A3"], tự động bọc mảng cho nó!
  if (typeof seatNumbers === 'string') {
    seatNumbers = [seatNumbers];
  }

  if (!tripId || !seatNumbers || !seatNumbers.length) {
    return res.status(400).json({ message: "Thiếu tripId hoặc seatNumbers" });
  }

  const t = await sequelize.transaction();

  try {
    const seats = await TripSeat.findAll({
      where: {
        tripId,
        seatNumber: seatNumbers,
      },
      lock: t.LOCK.UPDATE, 
      transaction: t,
    });

    // 🔥 Chèn quả log này vào để lần sau lỡ có lỗi mày nhìn Terminal là biết ngay ai sai
    if (seats.length !== seatNumbers.length) {
      console.log(`[DEBUG LỖI GHẾ] DB tìm thấy: ${seats.length}. Frontend đòi: ${seatNumbers.length}. Data gửi lên:`, seatNumbers);
      throw new Error("Có ghế không tồn tại");
    }

    const now = new Date();

    for (const seat of seats) {
      if (seat.status === "booked") {
        throw new Error(`Ghế ${seat.seatNumber} đã được đặt`);
      }

      if (
        seat.status === "pending" &&
        seat.pendingUntil &&
        new Date(seat.pendingUntil) > now
      ) {
        throw new Error(`Ghế ${seat.seatNumber} đang được giữ`);
      }
    }

    // update tất cả ghế
    const pendingUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await TripSeat.update(
      {
        status: "pending",
        pendingUntil,
      },
      {
        where: {
          tripId,
          seatNumber: seatNumbers,
        },
        transaction: t,
      }
    );

    await t.commit();

    return res.status(200).json({
      message: "Giữ ghế thành công",
      pendingUntil,
    });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi hold ghế:", error);
    return res.status(400).json({ message: error.message });
  }
};

export const releaseSeats = async (req, res) => {
  const { tripId, seatNumbers } = req.body;

  await TripSeat.update(
    {
      status: "available",
      pendingUntil: null,
    },
    {
      where: {
        tripId,
        seatNumber: seatNumbers,
      },
    }
  );

  return res.json({ message: "Đã trả ghế" });
};

export const autoReleaseSeats = async () => {
  await TripSeat.update(
    {
      status: "available",
      pendingUntil: null,
    },
    {
      where: {
        status: "pending",
        pendingUntil: {
          [Op.lt]: new Date(),
        },
      },
    }
  );
};