import express from 'express';
import {
  createBusType,
  getAllBusTypes,
  getBusTypeById,
  updateBusType,
  deleteBusType
} from '../controllers/busTypeController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',     getAllBusTypes);                   // Ai cũng xem được
router.get('/:id',  getBusTypeById);                  // Ai cũng xem được
router.post('/',    requireAdmin, createBusType);      // Chỉ Admin
router.put('/:id',  requireAdmin, updateBusType);      // Chỉ Admin
router.delete('/:id', requireAdmin, deleteBusType);    // Chỉ Admin

export default router;

