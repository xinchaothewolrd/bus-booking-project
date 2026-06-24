import express from 'express';
import * as busController from '../controllers/busController.js';

const router = express.Router();

router.get('/', busController.getAllBuses);
router.get('/:id', busController.getBusById);
router.post('/', busController.createBus);
router.put('/:id', busController.updateBus);
router.delete('/:id', busController.deleteBus);

export default router;
