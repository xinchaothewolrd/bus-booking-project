import express from 'express';
import * as priceRuleController from '../controllers/priceRuleController.js';

const router = express.Router();

router.get('/', priceRuleController.getAllPriceRules);
router.get('/active', priceRuleController.getActivePriceRules);
router.get('/:id', priceRuleController.getPriceRuleById);
router.post('/', priceRuleController.createPriceRule);
router.put('/:id', priceRuleController.updatePriceRule);
router.delete('/:id', priceRuleController.deletePriceRule);

export default router;
