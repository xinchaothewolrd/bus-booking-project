import express from 'express';
import { 
  createTrip, 
  getAllTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip,
  searchTrips 
} from '../controllers/tripController.js';

const router = express.Router();

router.post('/', createTrip);
router.get('/', getAllTrips);

// 🔥 đặt search lên trên
router.get('/search', searchTrips);

router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
