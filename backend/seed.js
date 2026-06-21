import bcrypt from "bcrypt";
import sequelize from "./src/libs/db.js";
import { User, Booking, Ticket, Payment, Session, Trip, TripSeat, RouteFare, PriceRule, Route, RouteStop } from "./src/libs/setupAssociations.js";
import BusType from "./src/models/BusType.js";
import Bus from "./src/models/Bus.js";

const seedDatabase = async () => {
  try {
    console.log("Đang bắt đầu quá trình Seed Database...");
    
    // Sync với force: true để xóa dữ liệu cũ và tạo lại bảng
    await sequelize.sync({ force: true });
    console.log("✅ Đã xóa dữ liệu cũ và khởi tạo lại các bảng!");

    const passwordHash = await bcrypt.hash("123456", 10);

    // 1. Seed Users (Staff & Customers)
    console.log("Đang tạo Users...");
    const usersData = [];
    // Tạo 5 nhân viên
    for (let i = 1; i <= 5; i++) {
      usersData.push({
        fullName: `Nhân viên Staff ${i}`,
        email: `staff${i}@gmail.com`,
        phone: `090000000${i}`,
        hashedPassword: passwordHash,
        role: "staff",
      });
    }
    for (let i = 1; i <= 20; i++) {
      usersData.push({
        fullName: `Khách User ${i}`,
        email: `user${i}@gmail.com`,
        phone: `08000000${i.toString().padStart(2, '0')}`,
        hashedPassword: passwordHash,
        role: "customer",
      });
    }
    const createdUsers = await User.bulkCreate(usersData);
    const customers = createdUsers.filter(u => u.role === "customer");

    // 2. Seed BusTypes & Buses
    console.log("Đang tạo Xe và Loại xe...");
    const typeSleeper = await BusType.create({ typeName: "Giường nằm 34", totalSeats: 34 });
    const typeLimo = await BusType.create({ typeName: "Limousine 22", totalSeats: 22 });

    const buses = await Bus.bulkCreate([
      { licensePlate: "51B-123.45", busTypeId: typeSleeper.id, driverName: "Bác tài A", status: "active" },
      { licensePlate: "51B-234.56", busTypeId: typeSleeper.id, driverName: "Bác tài B", status: "active" },
      { licensePlate: "51B-345.67", busTypeId: typeLimo.id, driverName: "Bác tài C", status: "active" },
      { licensePlate: "51B-456.78", busTypeId: typeLimo.id, driverName: "Bác tài D", status: "active" },
      { licensePlate: "51B-567.89", busTypeId: typeSleeper.id, driverName: "Bác tài E", status: "active" },
    ]);

    // 3. Seed Routes & Stops
    console.log("Đang tạo Tuyến đường và Trạm dừng...");
    const routeSG_DL = await Route.create({ departureLocation: "TP. Hồ Chí Minh", arrivalLocation: "Đà Lạt", distanceKm: 300, durationEst: "06:00:00" });
    const routeSG_NT = await Route.create({ departureLocation: "TP. Hồ Chí Minh", arrivalLocation: "Nha Trang", distanceKm: 400, durationEst: "08:00:00" });

    const stops = await RouteStop.bulkCreate([
      { routeId: routeSG_DL.id, stopName: "Bến xe Miền Đông mới", stopType: "pickup", stopOrder: 1, arriveOffsetMinutes: 0 },
      { routeId: routeSG_DL.id, stopName: "Trạm Biên Hòa", stopType: "both", stopOrder: 2, arriveOffsetMinutes: 60 },
      { routeId: routeSG_DL.id, stopName: "Bến xe Liên tỉnh Đà Lạt", stopType: "dropoff", stopOrder: 3, arriveOffsetMinutes: 360 },
      
      { routeId: routeSG_NT.id, stopName: "Bến xe Miền Đông", stopType: "pickup", stopOrder: 1, arriveOffsetMinutes: 0 },
      { routeId: routeSG_NT.id, stopName: "Ngã ba Vũng Tàu", stopType: "both", stopOrder: 2, arriveOffsetMinutes: 45 },
      { routeId: routeSG_NT.id, stopName: "Bến xe phía Nam Nha Trang", stopType: "dropoff", stopOrder: 3, arriveOffsetMinutes: 480 },
    ]);

    // Lấy các stop cụ thể để gán vào vé
    const sgDlPickup = stops.find(s => s.routeId === routeSG_DL.id && s.stopType === "pickup");
    const sgDlDropoff = stops.find(s => s.routeId === routeSG_DL.id && s.stopType === "dropoff");

    // 4. Seed Trips & TripSeats
    console.log("Đang tạo Chuyến xe (Trips) và Ghế (TripSeats)...");
    const trips = [];
    const now = new Date();
    
    // Tạo 5 chuyến trong tương lai và 5 chuyến trong quá khứ
    for(let i = 0; i < 10; i++) {
      const departure = new Date(now);
      if (i < 5) {
        departure.setDate(departure.getDate() + (i + 1)); // Tương lai
      } else {
        departure.setDate(departure.getDate() - (i - 4)); // Quá khứ
      }
      
      const route = i % 2 === 0 ? routeSG_DL : routeSG_NT;
      const bus = buses[i % buses.length];
      const arrival = new Date(departure);
      const minutesToAdd = route === routeSG_DL ? 360 : 480;
      arrival.setMinutes(arrival.getMinutes() + minutesToAdd);

      const trip = await Trip.create({
        routeId: route.id,
        busId: bus.id,
        departureTime: departure,
        arrivalTimeExpected: arrival,
        status: i < 5 ? "scheduled" : "completed",
      });
      trips.push(trip);

      // Tạo ghế cho trip này (phụ thuộc vào busType)
      const busType = bus.busTypeId === typeSleeper.id ? typeSleeper : typeLimo;
      const seats = [];
      const half = Math.floor(busType.totalSeats / 2);
      for(let s = 1; s <= busType.totalSeats; s++) {
        let seatNum = s <= half ? `A${s}` : `B${s - half}`;
        seats.push({
          tripId: trip.id,
          seatNumber: seatNum,
          status: "available",
        });
      }
      await TripSeat.bulkCreate(seats);
    }

    // 5. Seed Bookings, Tickets, Payments
    console.log("Đang tạo Đơn hàng, Vé và Thanh toán...");
    let bookingCounter = 1;

    for (let trip of trips) {
      // Lấy tất cả ghế của trip này
      const tripSeats = await TripSeat.findAll({ where: { tripId: trip.id } });
      let availableSeats = [...tripSeats];

      // Đặt 5-10 booking cho mỗi trip
      const numBookings = Math.floor(Math.random() * 6) + 5; 
      
      for(let b = 0; b < numBookings; b++) {
        if (availableSeats.length === 0) break;

        const customer = customers[Math.floor(Math.random() * customers.length)];
        const numTickets = Math.floor(Math.random() * 3) + 1; // 1 đến 3 vé mỗi đơn
        
        if (availableSeats.length < numTickets) break;

        const selectedSeats = availableSeats.splice(0, numTickets);
        const totalAmount = numTickets * 300000;
        
        // Trạng thái đơn hàng
        const statuses = ["paid", "pending", "cancelled"];
        const bookingStatus = trip.status === "completed" ? "paid" : statuses[Math.floor(Math.random() * statuses.length)];

        const booking = await Booking.create({
          userId: customer.id,
          tripId: trip.id,
          totalAmount: totalAmount,
          status: bookingStatus,
          bookingTime: new Date(trip.departureTime.getTime() - 86400000 * Math.random()), // Đặt trước 0-1 ngày
        });

        // Tạo Payment nếu paid
        if (bookingStatus === "paid") {
          await Payment.create({
            bookingId: booking.id,
            amount: totalAmount,
            paymentMethod: "bank_transfer",
            status: "success",
            transactionId: `BANK${Math.floor(Math.random() * 100000000)}`,
          });
        }

        // Tạo Tickets
        for (let seat of selectedSeats) {
          // Cập nhật trạng thái ghế
          await seat.update({ status: bookingStatus === "cancelled" ? "available" : "booked" });

          // Xác định status của vé
          let ticketStatus = "unused";
          if (bookingStatus === "cancelled") ticketStatus = "cancelled";
          else if (trip.status === "completed") ticketStatus = "used";
          // Test staff scanner: một số vé của chuyến tương lai có thể đã check-in sớm (hoặc giả lập)
          else if (Math.random() > 0.7) ticketStatus = "used"; 

          await Ticket.create({
            bookingId: booking.id,
            tripSeatId: seat.id,
            passengerName: customer.fullName,
            passengerPhone: customer.phone,
            pickupStopId: sgDlPickup?.id,
            dropoffStopId: sgDlDropoff?.id,
            qrCode: `QR-TRIP${trip.id}-SEAT${seat.id}-${Math.random().toString(36).substring(7).toUpperCase()}`,
            status: ticketStatus,
          });
        }
      }
    }

    console.log("🎉 SEED DỮ LIỆU THÀNH CÔNG! Bạn có thể sử dụng hệ thống ngay bây giờ.");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi trong quá trình Seed Database:", error);
    process.exit(1);
  }
};

seedDatabase();
