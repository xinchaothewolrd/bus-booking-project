import express from 'express';
import proxy from 'express-http-proxy';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
const TRIP_SERVICE = process.env.TRIP_SERVICE_URL;

// ─── Trips ───────────────────────────────────────────────────────────────────
router.get('/trips',        verifyToken, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/trips/:id',    verifyToken, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/trips',       verifyToken, requireAdmin, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/trips/:id',    verifyToken, requireAdmin, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/trips/:id', verifyToken, requireAdmin, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Trip Seats ───────────────────────────────────────────────────────────────
// Fix: Trip Service nhận ?tripId= dạng query param, không phải path param
// GET /api/trip-seats/trip/:tripId → forward → /api/trip-seats?tripId=:tripId
router.get('/trip-seats/trip/:tripId', verifyToken, proxy(TRIP_SERVICE, {
  proxyReqPathResolver: (req) => `/api/trip-seats?tripId=${req.params.tripId}`,
}));

// Lấy danh sách tất cả ghế (với query params tuỳ ý)
router.get('/trip-seats', verifyToken, proxy(TRIP_SERVICE, {
  proxyReqPathResolver: (req) => `/api${req.url}`,
}));

// Lock / Confirm / Release ghế (nội bộ, nhưng expose để Order Service gọi trực tiếp nếu cần)
router.post('/trip-seats/lock',    verifyToken, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api/trip-seats/lock` }));
router.post('/trip-seats/confirm', verifyToken, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api/trip-seats/confirm` }));
router.post('/trip-seats/release', verifyToken, proxy(TRIP_SERVICE, { proxyReqPathResolver: (req) => `/api/trip-seats/release` }));

export default router;
