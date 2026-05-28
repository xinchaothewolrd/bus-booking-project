import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const BusType = sequelize.define("BusType", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  typeName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'type_name' // Tương ứng cột type_name trong db
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_seats'
  },
  seatLayout: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'seat_layout'
  }
}, {
  tableName: 'bus_types', // Tên bảng thực tế trong Database
  timestamps: false // Trong SQL dump của bạn bảng bus_types không có createdAt, updatedAt nên ta tắt tính năng auto add
});

export default BusType;
