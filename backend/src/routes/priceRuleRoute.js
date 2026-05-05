import express from "express";
import {
  getAllPriceRules,
  getActivePriceRules,
  getPriceRuleById,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
} from "../controllers/priceRuleController.js";
import { requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",        getAllPriceRules);                   // Ai cũng xem được
router.get("/active",  getActivePriceRules);               // Ai cũng xem được (frontend tính giá)
router.get("/:id",     getPriceRuleById);                  // Ai cũng xem được
router.post("/",       requireAdmin, createPriceRule);      // Chỉ Admin
router.put("/:id",     requireAdmin, updatePriceRule);      // Chỉ Admin
router.delete("/:id",  requireAdmin, deletePriceRule);      // Chỉ Admin

export default router;
