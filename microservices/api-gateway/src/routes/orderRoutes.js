import express from 'express';
import proxy from 'express-http-proxy';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL;

// ─── Bookings ─────────────────────────────────────────────────────────────────
router.get('/bookings',            verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/bookings/:id',        verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/bookings',           verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/bookings/:id/cancel', verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/bookings/:id/confirm',verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Payments ─────────────────────────────────────────────────────────────────
router.post('/payments',         verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/payments/:id',      verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/payments/:id',      verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Tickets ─────────────────────────────────────────────────────────────────
router.get('/tickets',              verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/tickets/code/:code',   verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/tickets/:id',          verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/tickets/:id/use',      verifyToken, proxy(ORDER_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

export default router;
