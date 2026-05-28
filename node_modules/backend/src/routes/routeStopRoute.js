import express from "express";
import {
  getAllRouteStops,
  getRouteStopById,
  createRouteStop,
  updateRouteStop,
  deleteRouteStop,
  getRouteStopsByRouteId
} from "../controllers/routeStopController.js";

const router = express.Router();

// GET / -> list (optionally filter by ?routeId=)
router.get("/", getAllRouteStops);
router.get("/routes/:routeId", getRouteStopsByRouteId);
router.get("/:id", getRouteStopById);
router.post("/", createRouteStop);
router.put("/:id", updateRouteStop);
router.delete("/:id", deleteRouteStop);

export default router;
