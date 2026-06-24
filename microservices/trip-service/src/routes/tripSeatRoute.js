import express from 'express';
import * as tripSeatController from '../controllers/tripSeatController.js';
import { Op } from 'sequelize';
import sequelize from '../libs/db.js';
import TripSeat from '../models/TripSeat.js';

const router = express.Router();

// ─── Basic CRUD endpoints ──────────────────────────────────────────────────────
router.get('/', tripSeatController.getAllTripSeats);
router.get('/by-trip/:tripId', tripSeatController.getSeatsByTripId);
router.get('/:id', tripSeatController.getTripSeatById);
router.post('/', tripSeatController.createTripSeat);
router.put('/:id', tripSeatController.updateTripSeat);
router.delete('/:id', tripSeatController.deleteTripSeat);

// ─── Advanced endpoints: Lock/Confirm seats ────────────────────────────────────
// POST /api/trip-seats/lock — Lock ghế khi user bắt đầu đặt
router.post('/lock', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tripId, seatNumbers, bookingId } = req.body;
    if (!tripId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Thiếu tripId hoặc seatNumbers' });
    }

    // Auto-release các ghế bị lock quá 10 phút
    await TripSeat.update(
      { status: 'available', bookingId: null, lockedAt: null },
      {
        where: {
          tripId,
          status: 'locked',
          lockedAt: { [Op.lt]: new Date(Date.now() - 10 * 60 * 1000) },
        },
        transaction: t,
      }
    );

    // Kiểm tra ghế có available không
    const seats = await TripSeat.findAll({
      where: { tripId, seatNumber: { [Op.in]: seatNumbers } },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const unavailable = seats.filter(s => s.status !== 'available');
    if (unavailable.length > 0) {
      await t.rollback();
      return res.status(409).json({
        message: 'Một số ghế đã được đặt hoặc đang bị giữ',
        seats: unavailable.map(s => s.seatNumber),
      });
    }

    // Lock ghế
    await TripSeat.update(
      { status: 'locked', bookingId: bookingId || null, lockedAt: new Date() },
      { where: { tripId, seatNumber: { [Op.in]: seatNumbers } }, transaction: t }
    );

    await t.commit();
    res.json({ message: 'Đã lock ghế thành công', seatNumbers });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

// POST /api/trip-seats/confirm — Xác nhận đặt ghế (sau khi thanh toán)
router.post('/confirm', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tripId, seatNumbers, bookingId } = req.body;
    if (!tripId || !seatNumbers || !bookingId) {
      await t.rollback();
      return res.status(400).json({ message: 'Thiếu tripId, seatNumbers hoặc bookingId' });
    }

    await TripSeat.update(
      { status: 'booked', bookingId },
      {
        where: { tripId, seatNumber: { [Op.in]: seatNumbers }, status: 'locked' },
        transaction: t,
      }
    );

    await t.commit();
    res.json({ message: 'Đã xác nhận đặt ghế', seatNumbers });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

export default router;
