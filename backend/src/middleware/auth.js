const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

function getBearerToken(req) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7).trim() || null;
} // lay token tu headers

async function authenticate(req, res, next) {
  const token = getBearerToken(req); // lay token tu headers
  if (!token) {
    const err = new Error('Unauthorized');
    err.status = 401;
    return next(err);
  } // neu token khong ton tai thi tra ve error 401

  const secret = process.env.JWT_SECRET; // lay secret tu file .env
  if (!secret) { // neu secret khong ton tai thi tra ve error 500
    const err = new Error('Server misconfiguration');
    err.status = 500;
    return next(err);
  }

  try {
    const payload = jwt.verify(token, secret); // verify token
    const userId = payload.sub; // lay userId tu payload
    if (userId == null) {
      const err = new Error('Unauthorized'); // neu userId khong ton tai thi tra ve error 401
      err.status = 401;
      return next(err);
    }

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?',
      [userId]
    ); // lay user tu database

    if (!rows.length) {
      const err = new Error('Unauthorized'); // neu user khong ton tai thi tra ve error 401
      err.status = 401;
      return next(err);
    }

    const user = rows[0];
    if (user.status === 'banned') {
      const err = new Error('Account is banned');
      err.status = 403;
      return next(err);
    }

    req.user = user; // gan user vao req
    next(); // chuyen den middleware tiep theo
  } catch (e) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }
    next(e);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      const err = new Error('Unauthorized');
      err.status = 401;
      return next(err);
    }
    if (!roles.includes(req.user.role)) {
      const err = new Error('Forbidden');
      err.status = 403;
      return next(err);
    }
    next();
  };
}

module.exports = { authenticate, requireRole, getBearerToken };
