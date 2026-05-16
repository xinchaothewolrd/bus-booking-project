// import express from 'express';
// import http from 'http';
// import { Server } from 'socket.io';
// import cors from "cors";
// import dotenv from 'dotenv';
// import { connectDB } from './libs/db.js';
// import authRoute from './routes/authRoute.js';
// import cron  from 'node-cron';
// import { cleanupExpiredSessions } from './models/Session.js';
// import { releaseExpiredSeats } from './jobs/releaseExpiredSeats.js';
// import cookieparser from 'cookie-parser'; // Import cookie-parser để xử lý cookie
// import userRoute from './routes/userRoute.js';
// import { protectedRoute } from './middlewares/authMiddleware.js'; // Import middleware bảo vệ route
// // Import routes cho Booking, Ticket, Payment module
// import bookingRoute from './routes/bookingRoute.js';
// import ticketRoute from './routes/ticketRoute.js';
// import paymentRoute from './routes/paymentRoute.js';
// // Setup model associations (tránh circular imports)
// import './libs/setupAssociations.js';


// import busTypeRoute from './routes/busTypeRoute.js';
// import routeRoute from './routes/routeRoute.js';
// import busRoute from './routes/busRoute.js';
// import tripRoute from './routes/tripRoute.js';
// import tripSeatRoute from './routes/tripSeatRoute.js';
// import routeFareRoute from './routes/routeFareRoute.js';
// import priceRuleRoute from './routes/priceRuleRoute.js';
// import routeStopRoute from './routes/routeStopRoute.js';
// dotenv.config();  // load bien moi truong tu file .env
// const app = express();
// const server = http.createServer(app);
// const PORT = process.env.PORT || 3000;

// // middleware
// app.use(express.json()); // hieu va doc duoc du lieu dang json tu client
// app.use(cookieparser()); // Sử dụng cookie-parser để có thể đọc và ghi cookie trong các route handler
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );
// //public routes
// app.use('/api/auth', authRoute); // Sử dụng route auth đã tạo
// //private routes
// app.use('/api/users', protectedRoute, userRoute); // Sử dụng route user đã tạo, và bảo vệ bằng middleware protectedRoute
// // Booking, Ticket, Payment routes (public routes - có thể protect sau)
// app.use('/api/bookings', bookingRoute);
// app.use('/api/tickets', ticketRoute);
// app.use('/api/payments', paymentRoute);

// // Routes của An (Bus Booking)
// app.use('/api/bus-types', protectedRoute, busTypeRoute); // Đã khóa bằng token (chỉ user đăng nhập mới xài được)
// app.use('/api/routes', protectedRoute, routeRoute); // Tuyến đường
// app.use('/api/buses', protectedRoute, busRoute); // Quản lý Xe Khách (bus)
// app.use('/api/trips', protectedRoute, tripRoute); // Quản lý Chuyến Đi (trips)
// app.use('/api/trip-seats', protectedRoute, tripSeatRoute); // Quản lý Ghế Ngồi (trip_seats)
// app.use('/api/route-fares', protectedRoute, routeFareRoute); // Bảng giá theo tuyến + loại xe
// app.use('/api/price-rules', protectedRoute, priceRuleRoute); // Luật tăng/giảm giá linh hoạt
// app.use('/api/route-stops', protectedRoute, routeStopRoute); // Điểm dừng thuộc tuyến (route_stops)
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server dang chay tren cong ${PORT}`);
//   });
// });
// // Lên lịch chạy hàm cleanupExpiredSessions mỗi ngày vào lúc 00:00 (giờ server)
// cron.schedule('0 0 * * *', async () => {
//   console.log("Running daily cleanup of expired sessions...");
//   await cleanupExpiredSessions();
// });

// // Lên lịch chạy releaseExpiredSeats mỗi 1 phút để giải phóng ghế hết hạn
// // Use Case U19: Tự động nhả ghế/Giải phóng ghế
// cron.schedule('*/1 * * * *', async () => {
//   await releaseExpiredSeats();
// });

import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Trùm cuối realtime
import cors from "cors";
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import cron  from 'node-cron';
import { cleanupExpiredSessions } from './models/Session.js';
import { releaseExpiredSeats } from './jobs/releaseExpiredSeats.js';
import cookieparser from 'cookie-parser'; 
import userRoute from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js'; 

import bookingRoute from './routes/bookingRoute.js';
import ticketRoute from './routes/ticketRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import './libs/setupAssociations.js';

import busTypeRoute from './routes/busTypeRoute.js';
import routeRoute from './routes/routeRoute.js';
import busRoute from './routes/busRoute.js';
import tripRoute from './routes/tripRoute.js';
import tripSeatRoute from './routes/tripSeatRoute.js';
import routeFareRoute from './routes/routeFareRoute.js';
import priceRuleRoute from './routes/priceRuleRoute.js';
import routeStopRoute from './routes/routeStopRoute.js';

dotenv.config();
const app = express();
const server = http.createServer(app); // Cực kỳ quan trọng
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend của mày
    credentials: true,
  })
);

// public routes
app.use('/api/auth', authRoute);
// private routes
app.use('/api/users', protectedRoute, userRoute);
// Booking, Ticket, Payment routes
app.use('/api/bookings', bookingRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/payments', paymentRoute);

// Routes của An (Bus Booking)
app.use('/api/bus-types', protectedRoute, busTypeRoute);
app.use('/api/routes', protectedRoute, routeRoute);
app.use('/api/buses', protectedRoute, busRoute);
app.use('/api/trips', protectedRoute, tripRoute);
app.use('/api/trip-seats', protectedRoute, tripSeatRoute);
app.use('/api/route-fares', protectedRoute, routeFareRoute);
app.use('/api/price-rules', protectedRoute, priceRuleRoute);
app.use('/api/route-stops', protectedRoute, routeStopRoute);


// 🚀🚀🚀 TÍCH HỢP SOCKET.IO VÀO ĐÂY 🚀🚀🚀
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Cho phép React kết nối
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Bộ nhớ tạm (RAM) lưu xem thằng nào đang ôm ghế nào
const holdSeatsTracker = new Map();

io.on('connection', (socket) => {
  console.log(`🔌 Giang hồ kết nối Socket: ${socket.id}`);

  // 1. Lắng nghe khi có thằng bấm giữ ghế
  socket.on('HOLD_SEAT', (data) => {
    const { tripId, seatNumber } = data;
    
    // Ghi sổ: Thằng socket.id này đang ôm ghế này
    holdSeatsTracker.set(socket.id, { tripId, seatNumber });

    // Dùng loa phường báo cho bọn còn lại biết ghế đang bị khóa
    socket.broadcast.emit('SEAT_UPDATED', {
      tripId,
      seatNumber,
      status: 'pending' // Chuyển ghế sang màu vàng/xám trên máy thằng khác
    });
  });

  // 2. Lắng nghe khi có thằng bấm nhả ghế (không mua nữa)
  socket.on('RELEASE_SEAT', (data) => {
    const { tripId, seatNumber } = data;
    
    // Xóa sổ
    holdSeatsTracker.delete(socket.id);

    // Báo cho bọn còn lại biết ghế đã xanh tươi trở lại
    socket.broadcast.emit('SEAT_UPDATED', {
      tripId,
      seatNumber,
      status: 'available' 
    });
  });

  // 3. XỬ LÝ RÁC: Khi user tắt tab, rớt mạng hoặc crash trình duyệt
  socket.on('disconnect', () => {
    console.log(`❌ Giang hồ đã out: ${socket.id}`);
    
    const holdData = holdSeatsTracker.get(socket.id);
    if (holdData) {
      // Nhả ghế ra cho thiên hạ mua
      socket.broadcast.emit('SEAT_UPDATED', {
        tripId: holdData.tripId,
        seatNumber: holdData.seatNumber,
        status: 'available'
      });
      // Xóa sổ nó luôn
      holdSeatsTracker.delete(socket.id);
    }
  });
});
// 🚀🚀🚀 HẾT KHÚC SOCKET.IO 🚀🚀🚀


// Khởi động server
connectDB().then(() => {
  // 🔥 CHÚ Ý: Bắt buộc phải là server.listen chứ KHÔNG PHẢI app.listen
  server.listen(PORT, () => {
    console.log(`✅ Server đang cháy trên cổng ${PORT} và Socket đã thông!`);
  });
});

// Lên lịch dọn rác
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily cleanup of expired sessions...");
  await cleanupExpiredSessions();
});

cron.schedule('*/1 * * * *', async () => {
  await releaseExpiredSeats();
});