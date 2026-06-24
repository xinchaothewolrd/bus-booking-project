import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './libs/db.js';
import authRoute from './routes/authRoute.js';
import cron  from 'node-cron';
import { cleanupExpiredSessions } from './models/Session.js';
import { releaseExpiredSeats } from './jobs/releaseExpiredSeats.js';
import cookieparser from 'cookie-parser'; // Import cookie-parser để xử lý cookie
import userRoute from './routes/userRoute.js';
import { protectedRoute } from './middlewares/authMiddleware.js'; // Import middleware bảo vệ route
// Import routes cho Booking, Ticket, Payment module
import bookingRoute from './routes/bookingRoute.js';
import ticketRoute from './routes/ticketRoute.js';
import paymentRoute from './routes/paymentRoute.js';
// Setup model associations (tránh circular imports)
import './libs/setupAssociations.js';


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
// Booking, Ticket, Payment routes (public routes - có thể protect sau)
app.use('/api/bookings', bookingRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/payments', paymentRoute);
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

// Lên lịch chạy releaseExpiredSeats mỗi 1 phút để giải phóng ghế hết hạn
// Use Case U19: Tự động nhả ghế/Giải phóng ghế
cron.schedule('*/1 * * * *', async () => {
  await releaseExpiredSeats();
});