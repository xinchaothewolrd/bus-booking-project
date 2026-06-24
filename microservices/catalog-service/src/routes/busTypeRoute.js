import express from 'express';
import * as busTypeController from '../controllers/busTypeController.js';

const router = express.Router();

router.get('/', busTypeController.getAllBusTypes);
router.get('/:id', busTypeController.getBusTypeById);
router.post('/', busTypeController.createBusType);
router.put('/:id', busTypeController.updateBusType);
router.delete('/:id', busTypeController.deleteBusType);

export default router;
