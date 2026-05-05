import express from 'express';
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} from '../controllers/routeController.js';
import { requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/',     getAllRoutes);                  // Ai cũng xem được
router.get('/:id',  getRouteById);                 // Ai cũng xem được
router.post('/',    requireAdmin, createRoute);     // Chỉ Admin
router.put('/:id',  requireAdmin, updateRoute);     // Chỉ Admin
router.delete('/:id', requireAdmin, deleteRoute);   // Chỉ Admin

export default router;
