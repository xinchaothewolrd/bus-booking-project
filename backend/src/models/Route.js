import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const Route = sequelize.define("Route", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  departureLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'departure_location'
  },
  arrivalLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'arrival_location'
  },
  distanceKm: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'distance_km'
  },
  durationEst: {
    type: DataTypes.TIME, // Kiểu dữ liệu thời gian mong đợi theo MySQL
    allowNull: true,
    field: 'duration_est'
  }
}, {
  tableName: 'routes', // Map thẳng vào bảng gốc
  timestamps: false    // Bảng gốc không dùng Sequelize tự chèn createdAt/updatedAt
});

export default Route;
