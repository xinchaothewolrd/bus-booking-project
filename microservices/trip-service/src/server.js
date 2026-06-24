import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './libs/db.js';
import tripRoute from './routes/tripRoute.js';
import tripSeatRoute from './routes/tripSeatRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5003;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ service: 'Trip Service', status: 'running', port: PORT });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/trips',      tripRoute);
app.use('/api/trip-seats', tripSeatRoute);

// ─── Start ───────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Trip Service đang chạy tại http://localhost:${PORT}`);
  });
});
