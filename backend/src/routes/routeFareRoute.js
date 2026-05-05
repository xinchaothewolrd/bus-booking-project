import express from "express";
import {
  getAllRouteFares,
  getRouteFareById,
  createRouteFare,
  updateRouteFare,
  deleteRouteFare,
} from "../controllers/routeFareController.js";
import { requireAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/",     getAllRouteFares);                   // Ai cũng xem được
router.get("/:id",  getRouteFareById);                  // Ai cũng xem được
router.post("/",    requireAdmin, createRouteFare);      // Chỉ Admin
router.put("/:id",  requireAdmin, updateRouteFare);      // Chỉ Admin
router.delete("/:id", requireAdmin, deleteRouteFare);    // Chỉ Admin

export default router;
