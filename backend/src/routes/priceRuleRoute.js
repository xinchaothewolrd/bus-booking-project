import express from "express";
import {
  getAllPriceRules,
  getActivePriceRules,
  getPriceRuleById,
  createPriceRule,
  updatePriceRule,
  deletePriceRule,
} from "../controllers/priceRuleController.js";

const router = express.Router();

router.get("/",          getAllPriceRules);    // Lấy toàn bộ luật giá
router.get("/active",    getActivePriceRules); // Lấy rule đang active (đặc biệt hữu ích cho frontend tính giá)
router.get("/:id",       getPriceRuleById);    // Lấy 1 luật giá
router.post("/",         createPriceRule);     // Tạo luật giá mới (Admin)
router.put("/:id",       updatePriceRule);     // Cập nhật luật giá (Admin)
router.delete("/:id",    deletePriceRule);     // Xóa luật giá (Admin)

export default router;
