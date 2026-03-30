const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');

const BCRYPT_ROUNDS = 10; // so lan hash password
const MIN_PASSWORD_LENGTH = 6; // do dai toi thieu cua password

function publicUser(row) {
  return { // tra ve user public
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
  };
}

function signToken(userId) {
  const secret = process.env.JWT_SECRET; // lay secret tu file .env
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'; // lay expiresIn tu file .env neu k co thi mac dinh la 7d
  return jwt.sign({ sub: userId }, secret, { expiresIn }); // sign token voi userId va secret
}

async function register(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {  // neu secret khong ton tai thi tra ve error 500
      const err = new Error('Server misconfiguration'); // tra ve error 500
      err.status = 500;
      return next(err);
    }

    const { full_name, email, phone, password } = req.body; // lay full_name, email, phone, password tu body request

    if (!email || typeof email !== 'string') {// validate email
      const err = new Error('Email is required'); // tra ve error 400
      err.status = 400;
      return next(err);
    }
    if (!password || typeof password !== 'string') {// validate password
      const err = new Error('Password is required'); // tra ve error 400
      err.status = 400;
      return next(err);
    }
    const trimmedEmail = email.trim().toLowerCase(); // trim email va chuyen thanh chu thuong
    if (!trimmedEmail) { // validate email
      const err = new Error('Email is required'); // tra ve error 400
      err.status = 400;
      return next(err);
    }
    if (password.length < MIN_PASSWORD_LENGTH) { // validate password
      const err = new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`); // tra ve error 400
      err.status = 400;
      return next(err);
    }

    let phoneValue = null; // khoi tao phoneValue
    if (phone != null && String(phone).trim() !== '') { // validate phone
      phoneValue = String(phone).trim(); // trim phone va chuyen thanh chu thuong
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);  //hash password voi BCRYPT_ROUNDS

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, phone, password, role, status)
       VALUES (?, ?, ?, ?, 'customer', 'active')`, // insert user voi full_name, email, phone, password, role, status
      [full_name?.trim() || null, trimmedEmail, phoneValue, passwordHash]
    );  

    const userId = result.insertId;  // lay userId tu result
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, status FROM users WHERE id = ?', // lay user tu database
      [userId]
    );
    const user = rows[0]; // lay user tu rows[0]
    const token = signToken(user.id); // sign token voi userId

    res.status(201).json({
      token,
      user: publicUser(user),
    }); // tra ve token va user
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') { // neu co loi loi email hoac phone da ton tai thi tra ve error 409
      const err = new Error('Email or phone already registered'); // tra ve error 409
      err.status = 409;
      return next(err);
    }
    next(e);
  }
}
// login
async function login(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) { // neu secret khong ton tai thi tra ve error 500
      const err = new Error('Server misconfiguration'); // tra ve error 500
      err.status = 500;
      return next(err);
    }

    const { email, phone, password } = req.body; // lay email, phone, password tu body request

    if (!password || typeof password !== 'string') { // validate password
      const err = new Error('Password is required'); // tra ve error 400  
      err.status = 400;
      return next(err);
    }
    if ((!email || String(email).trim() === '') && (!phone || String(phone).trim() === '')) { // validate email or phone
      const err = new Error('Email or phone is required'); // tra ve error 400
      err.status = 400;
      return next(err);
    }

    let rows; // khoi tao rows
    if (email != null && String(email).trim() !== '') { // validate email
      const trimmedEmail = String(email).trim().toLowerCase(); // trim email va chuyen thanh chu thuong
      const [r] = await pool.query( // lay user tu database
        'SELECT id, full_name, email, phone, password, role, status FROM users WHERE email = ?',
        [trimmedEmail] // lay user tu database
      );
      rows = r; // gan rows voi r
    } else { // validate phone
      const trimmedPhone = String(phone).trim(); // trim phone va chuyen thanh chu thuong
      const [r] = await pool.query( // lay user tu database
        'SELECT id, full_name, email, phone, password, role, status FROM users WHERE phone = ?',
        [trimmedPhone] // lay user tu database
      );
      rows = r; // gan rows voi r
    }

    if (!rows.length) { // validate rows
      const err = new Error('Invalid credentials'); // tra ve error 401
      err.status = 401;
      return next(err); 
    }

    const user = rows[0]; // lay user tu rows[0]
    const match = await bcrypt.compare(password, user.password || ''); // compare password voi password cua user
    if (!match) { // validate match
      const err = new Error('Invalid credentials'); // tra ve error 401
      err.status = 401;
      return next(err);
    }

    if (user.status === 'banned') { // validate status
      const err = new Error('Account is banned'); // tra ve error 403
      err.status = 403;
      return next(err);
    }

    const token = signToken(user.id); // sign token voi userId
    delete user.password; // xoa password cua user
    res.json({
      token,
      user: publicUser(user),
    }); // tra ve token va user
  } catch (e) {
    next(e); // tra ve error
  }
}

async function me(req, res, next) {
  try {
    res.json({ user: publicUser(req.user) }); // tra ve user
  } catch (e) {
    next(e); // tra ve error
  }
}

module.exports = { register, login, me };
