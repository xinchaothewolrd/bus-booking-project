import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './libs/db.js';

// Routes
import busTypeRoute from './routes/busTypeRoute.js';
import busRoute from './routes/busRoute.js';
import routeRoute from './routes/routeRoute.js';
import routeStopRoute from './routes/routeStopRoute.js';
import routeFareRoute from './routes/routeFareRoute.js';
import priceRuleRoute from './routes/priceRuleRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Catalog Service', status: 'running', port: PORT });
});

// Routes (không cần auth - đã được API Gateway xử lý)
app.use('/api/bus-types',   busTypeRoute);
app.use('/api/buses',       busRoute);
app.use('/api/routes',      routeRoute);
app.use('/api/route-stops', routeStopRoute);
app.use('/api/route-fares', routeFareRoute);
app.use('/api/price-rules', priceRuleRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Catalog Service đang chạy tại http://localhost:${PORT}`);
  });
});
