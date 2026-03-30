const mysql = require('mysql2/promise'); 

const pool = mysql.createPool({ // tao pool ket noi den database
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306, // port cua database ( tu file .env) neu k co thi mac dinh la 3306
  user: process.env.DB_USER || 'root', // user cua database ( tu file .env) neu k co thi mac dinh la root
  password: process.env.DB_PASSWORD ?? '', // password cua database ( tu file .env) neu k co thi mac dinh la ''
  database: process.env.DB_NAME || 'bus_booking_system', // name cua database ( tu file .env) neu k co thi mac dinh la bus_booking_system
  waitForConnections: true, // cho phep ket noi den database
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10, // so luong ket noi den database ( tu file .env) neu k co thi mac dinh la 10
  queueLimit: 0, // so luong ket noi den database ( tu file .env) neu k co thi mac dinh la 0
});

module.exports = { pool };
