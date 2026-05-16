import express from "express";
import {
  getRouteStops,
  getRouteStopById,
  createRouteStop,
  updateRouteStop,
  deleteRouteStop,
} from "../controllers/routeStopController.js";

const router = express.Router();

router.get("/", getRouteStops);
router.get("/:id", getRouteStopById);
router.post("/", createRouteStop);
router.put("/:id", updateRouteStop);
router.delete("/:id", deleteRouteStop);

export default router;
