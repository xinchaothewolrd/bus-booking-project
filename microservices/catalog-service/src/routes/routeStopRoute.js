import express from 'express';
import * as routeStopController from '../controllers/routeStopController.js';

const router = express.Router();

router.get('/', routeStopController.getRouteStops);
router.get('/:id', routeStopController.getRouteStopById);
router.post('/', routeStopController.createRouteStop);
router.put('/:id', routeStopController.updateRouteStop);
router.delete('/:id', routeStopController.deleteRouteStop);

export default router;
