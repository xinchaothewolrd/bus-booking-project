import express from 'express';
import { 
  createTripSeat, 
  getAllTripSeats, 
  getTripSeatById, 
  updateTripSeat, 
  deleteTripSeat,
  getSeatsByTripId
} from '../controllers/tripSeatController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',               getAllTripSeats);                    // Ai cũng xem được
router.get('/:id',            getTripSeatById);                   // Ai cũng xem được
router.get('/trip/:tripId',   getSeatsByTripId);                  // Ai cũng xem được (user xem ghế khi đặt vé)
router.post('/',              requireAdmin, createTripSeat);      // Chỉ Admin
router.put('/:id',            requireAdmin, updateTripSeat);      // Chỉ Admin
router.delete('/:id',         requireAdmin, deleteTripSeat);      // Chỉ Admin

export default router;
