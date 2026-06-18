import "dotenv/config"; // Tải biến môi trường ngay đầu tiên
import express from "express";
import http from "http";
import { Server } from "socket.io"; // Trùm cuối realtime
import cors from "cors";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import cron from "node-cron";
import { cleanupExpiredSessions } from "./models/Session.js";
import { releaseExpiredSeats } from "./jobs/releaseExpiredSeats.js";
import cookieparser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";

import bookingRoute from "./routes/bookingRoute.js";
import ticketRoute from "./routes/ticketRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import "./libs/setupAssociations.js";

import busTypeRoute from "./routes/busTypeRoute.js";
import routeRoute from "./routes/routeRoute.js";
import busRoute from "./routes/busRoute.js";
import tripRoute from "./routes/tripRoute.js";
import tripSeatRoute from "./routes/tripSeatRoute.js";
import routeFareRoute from "./routes/routeFareRoute.js";
import priceRuleRoute from "./routes/priceRuleRoute.js";
import routeStopRoute from "./routes/routeStopRoute.js";

const app = express();
const server = http.createServer(app); // Cực kỳ quan trọng
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());
app.use(cookieparser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// public routes
app.use("/api/auth", authRoute);
// private routes
app.use("/api/users", protectedRoute, userRoute);
// Booking, Ticket, Payment routes
app.use("/api/bookings", bookingRoute);
app.use("/api/tickets", ticketRoute);
app.use("/api/payments", paymentRoute);

// Routes của An (Bus Booking)
app.use("/api/bus-types", protectedRoute, busTypeRoute);
app.use("/api/routes", routeRoute);
app.use("/api/buses", protectedRoute, busRoute);
app.use("/api/trips", tripRoute);
app.use("/api/trip-seats", protectedRoute, tripSeatRoute);
app.use("/api/route-fares", protectedRoute, routeFareRoute);
app.use("/api/price-rules", protectedRoute, priceRuleRoute);
app.use("/api/route-stops", protectedRoute, routeStopRoute);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const holdSeatsTracker = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 kết nối Socket: ${socket.id}`);

  socket.on("HOLD_SEAT", (data) => {
    const { tripId, seatNumber } = data;

    holdSeatsTracker.set(socket.id, { tripId, seatNumber });

    socket.broadcast.emit("SEAT_UPDATED", {
      tripId,
      seatNumber,
      status: "pending",
    });
  });

  socket.on("RELEASE_SEAT", (data) => {
    const { tripId, seatNumber } = data;
    holdSeatsTracker.delete(socket.id);

    socket.broadcast.emit("SEAT_UPDATED", {
      tripId,
      seatNumber,
      status: "available",
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌  đã out: ${socket.id}`);

    const holdData = holdSeatsTracker.get(socket.id);
    if (holdData) {
      socket.broadcast.emit("SEAT_UPDATED", {
        tripId: holdData.tripId,
        seatNumber: holdData.seatNumber,
        status: "available",
      });
      holdSeatsTracker.delete(socket.id);
    }
  });
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server đang cháy trên cổng ${PORT} và Socket đã thông!`);
  });
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running daily cleanup of expired sessions...");
  await cleanupExpiredSessions();
});

cron.schedule("*/1 * * * *", async () => {
  await releaseExpiredSeats();
});
