import express from "express";
import {
  getAllRouteFares,
  getRouteFareById,
  createRouteFare,
  updateRouteFare,
  deleteRouteFare,
} from "../controllers/routeFareController.js";

const router = express.Router();

router.get("/",     getAllRouteFares);    // Lấy toàn bộ bảng giá
router.get("/:id",  getRouteFareById);   // Lấy 1 mức giá
router.post("/",    createRouteFare);    // Tạo mức giá mới (Admin)
router.put("/:id",  updateRouteFare);    // Cập nhật mức giá (Admin)
router.delete("/:id", deleteRouteFare); // Xóa mức giá (Admin)

export default router;
