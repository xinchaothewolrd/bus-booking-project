import express from 'express';
import { 
  createTrip, 
  getAllTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip,
  searchTrips 
} from '../controllers/tripController.js';
import { protectedRoute, requireAdmin, requireStaff } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protectedRoute, requireStaff, createTrip);
router.get('/', getAllTrips);

// 🔥 đặt search lên trên
router.get('/search', searchTrips);

router.get('/:id', getTripById);
router.put('/:id', protectedRoute, requireStaff, updateTrip);
router.delete('/:id', protectedRoute, requireAdmin, deleteTrip);

export default router;
