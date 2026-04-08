import express from 'express';
import { 
  createTrip, 
  getAllTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip 
} from '../controllers/tripController.js';

const router = express.Router();

router.post('/', createTrip);
router.get('/', getAllTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
