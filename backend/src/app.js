const express = require('express'); // import express
const cors = require('cors'); // import cors cho phep truy cap tu domain khac

const authRoutes = require('./routes/authRoutes');

const app = express(); // tao app express ( tao server express)

app.use(cors()); // cho phep frontend goi api tu backend
app.use(express.json()); //  parse json tu request 

app.get('/health', (req, res) => { 
  res.json({ ok: true }); 
}); // check server co chay hay khong

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
}); // neu request khong ton tai thi tra ve 404

app.use((err, req, res, _next) => {
  const status = err.status ?? err.statusCode ?? 500; // neu err co status thi lay status, neu khong thi lay statusCode, neu khong thi mac dinh la 500
  const message = err.message || 'Internal Server Error'; // neu err co message thi lay message, neu khong thi tra ve 'Internal Server Error'
  res.status(status).json({ error: message }); // tra ve error voi status va message
});

module.exports = { app };
