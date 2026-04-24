import express from 'express';
import { 
  createTripSeat, 
  getAllTripSeats, 
  getTripSeatById, 
  updateTripSeat, 
  deleteTripSeat,
  getSeatsByTripId // Import hàm load ghế theo chuyến
} from '../controllers/tripSeatController.js';

const router = express.Router();

router.post('/', createTripSeat);
router.get('/', getAllTripSeats);
router.get('/:id', getTripSeatById);
router.put('/:id', updateTripSeat);
router.delete('/:id', deleteTripSeat);

// API Mở rộng lấy riêng theo ID của Chuyến Đi (tripId)
router.get('/trip/:tripId', getSeatsByTripId);

export default router;
