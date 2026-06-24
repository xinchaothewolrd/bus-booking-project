// releaseExpiredSeats.js - Background job tự động nhả ghế hết hạn
// Chạy mỗi 1 phút, check TripSeats có status=pending + pending_until < now

import TripSeat from "../models/TripSeat.js";
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";
import { Op } from "sequelize";

export const releaseExpiredSeats = async () => {
  try {
    const now = new Date();

    // Tìm tất cả ghế đang pending đã quá hạn
    const expiredSeats = await TripSeat.findAll({
      where: {
        status: "pending",
        pendingUntil: { [Op.lt]: now },
      },
    });

    if (expiredSeats.length === 0) return;

    console.log(`[${now.toISOString()}] Found ${expiredSeats.length} expired seat(s). Releasing...`);

    for (const seat of expiredSeats) {
      try {
        // Tìm ticket liên quan (dùng tripSeatId - JS property name, Sequelize tự map sang trip_seat_id)
        const ticket = await Ticket.findOne({
          where: { tripSeatId: seat.id },
          include: [{ model: Booking, as: "Booking" }],
        });

        if (ticket && ticket.Booking) {
          const booking = ticket.Booking;
          if (booking.status === "pending") {
            booking.status = "cancelled";
            await booking.save();
            console.log(`  → Cancelled booking #${booking.id} (timeout)`);
          }
          // Cập nhật vé về cancelled
          if (ticket.status === "unused") {
            ticket.status = "cancelled";
            await ticket.save();
          }
        }

        // Nhả ghế
        seat.status = "available";
        seat.pendingUntil = null;
        await seat.save();

        console.log(`  → Released seat #${seat.id} (${seat.seatNumber}) - trip #${seat.tripId}`);
      } catch (error) {
        console.error(`  ✗ Error releasing seat #${seat.id}:`, error.message);
      }
    }

    console.log(`[${now.toISOString()}] Done releasing ${expiredSeats.length} seat(s)`);
  } catch (error) {
    console.error("[releaseExpiredSeats] Error:", error);
  }
};

export default releaseExpiredSeats;
