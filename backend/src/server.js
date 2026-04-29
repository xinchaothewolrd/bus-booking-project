import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import cron  from 'node-cron';
import { cleanupExpiredSessions } from './models/Session.js';
import cookieparser from 'cookie-parser'; // Import cookie-parser để xử lý cookie
import userRoute from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js'; // Import middleware bảo vệ route
import busTypeRoute from './routes/busTypeRoute.js';
import routeRoute from './routes/routeRoute.js';
import busRoute from './routes/busRoute.js';
import tripRoute from './routes/tripRoute.js';
import tripSeatRoute from './routes/tripSeatRoute.js';
import routeFareRoute from './routes/routeFareRoute.js';
import priceRuleRoute from './routes/priceRuleRoute.js';
dotenv.config();  // load bien moi truong tu file .env
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json()); // hieu va doc duoc du lieu dang json tu client
app.use(cookieparser()); // Sử dụng cookie-parser để có thể đọc và ghi cookie trong các route handler
//public routes
app.use('/api/auth', authRoute); // Sử dụng route auth đã tạo
//private routes
app.use('/api/users', protectedRoute, userRoute); // Sử dụng route user đã tạo, và bảo vệ bằng middleware protectedRoute

// Routes của An (Bus Booking)
app.use('/api/bus-types', protectedRoute, busTypeRoute); // Đã khóa bằng token (chỉ user đăng nhập mới xài được)
app.use('/api/routes', protectedRoute, routeRoute); // Tuyến đường
app.use('/api/buses', protectedRoute, busRoute); // Quản lý Xe Khách (bus)
app.use('/api/trips', protectedRoute, tripRoute); // Quản lý Chuyến Đi (trips)
app.use('/api/trip-seats', protectedRoute, tripSeatRoute); // Quản lý Ghế Ngồi (trip_seats)
app.use('/api/route-fares', protectedRoute, routeFareRoute); // Bảng giá theo tuyến + loại xe
app.use('/api/price-rules', protectedRoute, priceRuleRoute); // Luật tăng/giảm giá linh hoạt
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server dang chay tren cong ${PORT}`);
  });
});
// Lên lịch chạy hàm cleanupExpiredSessions mỗi ngày vào lúc 00:00 (giờ server)
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily cleanup of expired sessions...");
  await cleanupExpiredSessions();
});