import express from 'express';
import proxy from 'express-http-proxy';
import { verifyToken, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();
const CATALOG_SERVICE = process.env.CATALOG_SERVICE_URL;

// ─── Bus Types ───────────────────────────────────────────────────────────────
router.get('/bus-types',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/bus-types/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/bus-types',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/bus-types/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/bus-types/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Buses ───────────────────────────────────────────────────────────────────
router.get('/buses',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/buses/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/buses',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/buses/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/buses/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Routes (Tuyến đường) ────────────────────────────────────────────────────
router.get('/routes',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/routes/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/routes',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/routes/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/routes/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Route Stops ─────────────────────────────────────────────────────────────
router.get('/route-stops',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/route-stops/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/route-stops',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/route-stops/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/route-stops/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Route Fares ─────────────────────────────────────────────────────────────
router.get('/route-fares',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/route-fares/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/route-fares',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/route-fares/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/route-fares/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

// ─── Price Rules ─────────────────────────────────────────────────────────────
router.get('/price-rules',        verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/price-rules/active', verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.get('/price-rules/:id',    verifyToken, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.post('/price-rules',       verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.put('/price-rules/:id',    verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));
router.delete('/price-rules/:id', verifyToken, requireAdmin, proxy(CATALOG_SERVICE, { proxyReqPathResolver: (req) => `/api${req.url}` }));

export default router;
