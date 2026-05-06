import { Op, fn, col, where } from "sequelize";
import Trip from "../models/Trip.js";
import Route from "../models/Route.js";
import Bus from "../models/Bus.js";
import BusType from "../models/BusType.js";
import RouteFare from "../models/RouteFare.js";
import PriceRule from "../models/PriceRule.js";
import TripSeat from "../models/TripSeat.js";

// Lấy toàn bộ danh sách chuyến xe
export const getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.findAll({
      include: [
        { model: Route, as: "route" },
        {
          model: Bus, as: "bus",
          include: [{ model: BusType, as: "busType" }], // Lấy thêm loại xe qua Bus
        },
      ],
    });
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Lỗi lấy danh sách chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// Lấy 1 chuyến xe theo ID
// export const getTripById = async (req, res) => {
//   try {
//     const trip = await Trip.findByPk(req.params.id, {
//       include: [
//         { model: Route, as: "route" },
//         {
//           model: Bus, as: "bus",
//           include: [{ model: BusType, as: "busType" }],
//         },
//       ],
//     });
//     if (!trip) return res.status(404).json({ message: "Chuyến đi không tồn tại." });
//     return res.status(200).json(trip);
//   } catch (error) {
//     console.error("Lỗi lấy chuyến đi:", error);
//     return res.status(500).json({ message: "Lỗi hệ thống." });
//   }
// };

// Lấy 1 chuyến xe theo ID (Đã độ thêm tính năng báo giá)
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id, {
      include: [
        { model: Route, as: "route" },
        {
          model: Bus, as: "bus",
          include: [{ model: BusType, as: "busType" }],
        },
      ],
    });

    if (!trip) return res.status(404).json({ message: "Chuyến đi không tồn tại." });

    // Ép sang JSON để dễ mông má thêm dữ liệu
    const t = trip.toJSON();

    // Nếu chuyến này chưa gán xe hoặc loại xe thì cho giá = 0 luôn
    if (!t.bus || !t.bus.busType) {
      t.price = 0;
      return res.status(200).json(t);
    }

    const busTypeId = t.bus.busType.id;
    const departureDate = new Date(t.departureTime);

    // 1. Móc giá gốc từ route_fares
    const fare = await RouteFare.findOne({
      where: { 
        route_id: t.routeId, 
        bus_type_id: busTypeId 
      }
    });

    let price = fare ? parseFloat(fare.basePrice) : 0;

    // 2. Nếu có giá gốc thì bắt đầu check luật phụ thu / giảm giá
    if (fare) {
      const rules = await PriceRule.findAll({
        where: {
          status: "active",
          start_date: { [Op.lte]: departureDate },
          end_date: { [Op.gte]: departureDate },
        },
        order: [["priority", "DESC"]],
      });

      rules.forEach((rule) => {
        const matchRoute = !rule.route_id || rule.route_id === t.routeId;
        const matchBusType = !rule.bus_type_id || rule.bus_type_id === busTypeId;

        if (matchRoute && matchBusType) {
          if (rule.priceMultiplier) price *= parseFloat(rule.priceMultiplier);
          if (rule.priceDelta) price += parseFloat(rule.priceDelta);
        }
      });
    }

    // 3. Gắn cái giá đã tính toán vào response
    t.price = Math.round(price);

    return res.status(200).json(t);
  } catch (error) {
    console.error("Lỗi lấy chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

export const createTrip = async (req, res) => {
  const t = await Trip.sequelize.transaction(); 
  
  try {
    const { routeId, busId, departureTime, arrivalTimeExpected, status, cancelPolicy } = req.body;

    if (!routeId || !departureTime || !busId) {
      return res.status(400).json({ message: "Thiếu thông tin tuyến đường, xe hoặc giờ khởi hành." });
    }

    // 1. Lấy thông tin xe và loại xe
    const bus = await Bus.findByPk(busId, {
      include: [{ model: BusType, as: 'busType' }],
      transaction: t
    });

    if (!bus || !bus.busType) {
      await t.rollback();
      return res.status(404).json({ message: "Xe hoặc Loại Xe không tồn tại." });
    }

    // 2. Tạo chuyến xe
    const newTrip = await Trip.create({
      routeId,
      busId,
      departureTime,
      arrivalTimeExpected: arrivalTimeExpected || null,
      status: status || "scheduled",
      cancelPolicy: cancelPolicy || null,
    }, { transaction: t });

    // 3. Parse JSON cấu trúc ghế
    const layout = typeof bus.busType.seatLayout === 'string' 
                   ? JSON.parse(bus.busType.seatLayout) 
                   : bus.busType.seatLayout;

    const floors = layout.floors || 1;
    const cols = layout.cols || 1;
    const rows = layout.rows || 1;

    const seatsToCreate = [];

    // 4. Thuật toán đẻ mã ghế: Tầng 1 (A), Tầng 2 (B)... số tịnh tiến
    for (let f = 0; f < floors; f++) {
      // 65 là 'A'. f=0 ra 'A', f=1 ra 'B', f=2 ra 'C'...
      const prefix = String.fromCharCode(65 + f); 
      
      // Tổng số ghế của 1 tầng
      const seatsPerFloor = rows * cols; 

      for (let i = 1; i <= seatsPerFloor; i++) {
        seatsToCreate.push({
          tripId: newTrip.id,
          seatNumber: `${prefix}${i}`, // Ví dụ: A1, A2... B1, B2...
          status: 'available',
        });
      }
    }

    // 5. Insert một cục ghế vào database
    await TripSeat.bulkCreate(seatsToCreate, { transaction: t });

    // Mọi thứ trơn tru thì commit
    await t.commit();

    return res.status(201).json({ message: "Tạo chuyến xe & sơ đồ ghế thành công!", data: newTrip });
  } catch (error) {
    await t.rollback();
    console.error("Lỗi tạo chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// Cập nhật thông tin chuyến xe
export const updateTrip = async (req, res) => {
  try {
    const { routeId, busId, departureTime, arrivalTimeExpected, status, cancelPolicy } = req.body;
    const trip = await Trip.findByPk(req.params.id);

    if (!trip) return res.status(404).json({ message: "Chuyến không tồn tại." });

    await trip.update({
      routeId,
      busId,
      departureTime,
      arrivalTimeExpected,
      status,
      cancelPolicy,
    });

    return res.status(200).json({ message: "Cập nhật thành công.", data: trip });
  } catch (error) {
    console.error("Lỗi cập nhật chuyến đi:", error);
    return res.status(500).json({ message: "Lỗi hệ thống." });
  }
};

// Xóa chuyến xe
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByPk(req.params.id);
    if (!trip) return res.status(404).json({ message: "Chuyến không tồn tại." });

    await trip.destroy();
    return res.status(200).json({ message: "Xóa chuyến xe thành công." });
  } catch (error) {
    console.error("Lỗi xóa chuyến đi:", error);
    return res.status(500).json({ message: "Không thể xóa vì đã có vé được đặt." });
  }
};

export const searchTrips = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    const route = await Route.findOne({
      where: {
        departure_location: from,
        arrival_location: to,
      },
    });

    if (!route) return res.json([]);

    const trips = await Trip.findAll({
      where: {
        routeId: route.id,
        status: "scheduled",
        [Op.and]: [
          where(fn("DATE", col("Trip.departure_time")), date),
        ],
      },
      include: [
        {
          model: Bus,
          as: "bus",
          include: [
            {
              model: BusType,
              as: "busType",
            },
          ],
        },
      ],
    });

    const fares = await RouteFare.findAll({
      where: { route_id: route.id },
    });

    const rules = await PriceRule.findAll({
      where: {
        status: "active",
        start_date: { [Op.lte]: new Date(date) },
        end_date: { [Op.gte]: new Date(date) },
      },
      order: [["priority", "DESC"]],
    });

    const result = trips.map((trip) => {
      const t = trip.toJSON(); // 🔥 FIX 1

      if (!t.bus || !t.bus.busType) return null;

      const busType = t.bus.busType;
      const busTypeId = busType.id;

      const fare = fares.find(f => f.bus_type_id === busTypeId);
      if (!fare) return null;

      let price = fare.basePrice; // 🔥 FIX 2

      rules.forEach((rule) => {
        const matchRoute =
          !rule.route_id || rule.route_id === t.routeId;

        const matchBusType =
          !rule.bus_type_id || rule.bus_type_id === busTypeId;

        if (matchRoute && matchBusType) {
          if (rule.priceMultiplier) price *= rule.priceMultiplier;
          if (rule.priceDelta) price += rule.priceDelta;
        }
      });

      const departure = new Date(t.departureTime);
      const arrival = new Date(t.arrivalTimeExpected);

      const durationMs = arrival - departure;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        trip_id: t.id,
        departure_location: from,
        arrival_location: to,
        departure_time: t.departureTime,
        arrival_time_expected: t.arrivalTimeExpected,
        duration: `${hours} giờ ${minutes} phút`,
        price: Math.round(price),
        bus_type: busType.typeName, // 🔥 FIX 3
      };
    }).filter(Boolean);

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
