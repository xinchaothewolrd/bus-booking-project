/**
 * app.js – Export Express app riêng biệt (không listen port).
 * Mục đích: Dùng cho Integration Test (supertest cần app object, không cần server đang chạy).
 */
import express from 'express';
import cors from 'cors';

import tripRoute     from './routes/tripRoute.js';
import tripSeatRoute from './routes/tripSeatRoute.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Trip Service', status: 'running' });
});

// Routes
app.use('/api/trips',      tripRoute);
app.use('/api/trip-seats', tripSeatRoute);

export default app;
