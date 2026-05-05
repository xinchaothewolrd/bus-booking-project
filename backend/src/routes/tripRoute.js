import express from 'express';
import { 
  createTrip, 
  getAllTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip 
} from '../controllers/tripController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',     getAllTrips);                  // Ai cũng xem được
router.get('/:id',  getTripById);                 // Ai cũng xem được
router.post('/',    requireAdmin, createTrip);     // Chỉ Admin
router.put('/:id',  requireAdmin, updateTrip);     // Chỉ Admin
router.delete('/:id', requireAdmin, deleteTrip);   // Chỉ Admin

export default router;
