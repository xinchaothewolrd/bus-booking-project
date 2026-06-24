import express from 'express';
import * as routeController from '../controllers/routeController.js';

const router = express.Router();

router.get('/', routeController.getAllRoutes);
router.get('/:id', routeController.getRouteById);
router.post('/', routeController.createRoute);
router.put('/:id', routeController.updateRoute);
router.delete('/:id', routeController.deleteRoute);

export default router;
