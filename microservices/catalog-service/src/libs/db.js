import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'mysql', logging: false }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Catalog Service] Kết nối database thành công.');
    await sequelize.sync({ alter: true });
    console.log('[Catalog Service] Đã đồng bộ các table!');
  } catch (error) {
    console.error('[Catalog Service] Lỗi kết nối database:', error);
    process.exit(1);
  }
};

export default sequelize;
