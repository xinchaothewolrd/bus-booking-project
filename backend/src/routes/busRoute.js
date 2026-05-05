import express from 'express';
import { 
  createBus, 
  getAllBuses, 
  getBusById, 
  updateBus, 
  deleteBus 
} from '../controllers/busController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',     getAllBuses);                 // Ai cũng xem được
router.get('/:id',  getBusById);                 // Ai cũng xem được
router.post('/',    requireAdmin, createBus);     // Chỉ Admin
router.put('/:id',  requireAdmin, updateBus);     // Chỉ Admin
router.delete('/:id', requireAdmin, deleteBus);   // Chỉ Admin

export default router;
