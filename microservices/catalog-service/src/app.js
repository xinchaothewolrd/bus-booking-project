/**
 * app.js – Export Express app riêng biệt (không listen port).
 * Mục đích: Dùng cho Integration Test (supertest cần app object, không cần server đang chạy).
 * server.js sẽ import file này và gọi app.listen().
 */
import express from 'express';
import cors from 'cors';

import busTypeRoute   from './routes/busTypeRoute.js';
import busRoute       from './routes/busRoute.js';
import routeRoute     from './routes/routeRoute.js';
import routeStopRoute from './routes/routeStopRoute.js';
import routeFareRoute from './routes/routeFareRoute.js';
import priceRuleRoute from './routes/priceRuleRoute.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Catalog Service', status: 'running' });
});

// Routes
app.use('/api/bus-types',   busTypeRoute);
app.use('/api/buses',       busRoute);
app.use('/api/routes',      routeRoute);
app.use('/api/route-stops', routeStopRoute);
app.use('/api/route-fares', routeFareRoute);
app.use('/api/price-rules', priceRuleRoute);

export default app;
