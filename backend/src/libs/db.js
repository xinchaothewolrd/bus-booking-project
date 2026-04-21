import {Sequelize} from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();  // load bien moi truong tu file .env

const sequelize = new Sequelize(
  process.env.DB_NAME, // database name
  process.env.DB_USER, // username
  process.env.DB_PASSWORD, // password
  {
    host: process.env.DB_HOST, // database host
    dialect: 'mysql', // database dialect
    logging: false, // disable logging
  }
);
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Ket noi voi database thanh cong.');

     await sequelize.sync({ alter: true }); // 👈 THÊM DÒNG NÀY
  } catch (error) {
    console.log('Khong the ket noi voi database:', error);
    process.exit(1); // thoat chuong trinh neu ket noi that bai
  }
};
export default sequelize; 