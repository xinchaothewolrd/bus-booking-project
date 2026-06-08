import express from 'express';
import {
  createRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} from '../controllers/routeController.js';

import { protectedRoute, requireAdmin, requireStaff } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protectedRoute, requireStaff, createRoute);
router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.put('/:id', protectedRoute, requireStaff, updateRoute);
router.delete('/:id', protectedRoute, requireAdmin, deleteRoute);

export default router;
