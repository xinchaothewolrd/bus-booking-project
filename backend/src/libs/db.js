import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",

    logging: false,

    timezone: "+07:00",
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Ket noi voi database thanh cong.");

    await sequelize.sync();
  } catch (error) {
    console.log("Khong the ket noi voi database:", error);
    process.exit(1);
  }
};

export default sequelize;