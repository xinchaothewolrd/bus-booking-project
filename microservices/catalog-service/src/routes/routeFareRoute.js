import express from 'express';
import * as routeFareController from '../controllers/routeFareController.js';

const router = express.Router();

router.get('/', routeFareController.getAllRouteFares);
router.get('/:id', routeFareController.getRouteFareById);
router.post('/', routeFareController.createRouteFare);
router.put('/:id', routeFareController.updateRouteFare);
router.delete('/:id', routeFareController.deleteRouteFare);

export default router;
