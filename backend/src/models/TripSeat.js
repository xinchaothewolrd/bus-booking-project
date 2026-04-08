import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Trip from "./Trip.js";

const TripSeat = sequelize.define("TripSeat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tripId: {
    type: DataTypes.INTEGER,
    field: 'trip_id',
    allowNull: true
  },
  seatNumber: { // VD: "A1", "A2", "B1"
    type: DataTypes.STRING(10),
    field: 'seat_number',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'pending', 'booked'),
    defaultValue: 'available',
    allowNull: true
  },
  pendingUntil: { // Hạn chờ giữ chỗ nếu trạng thái là pending
    type: DataTypes.DATE,
    field: 'pending_until',
    allowNull: true
  }
}, {
  tableName: 'trip_seats',
  timestamps: false
});

// Quan hệ 1 chuyến đi - Nhiều chỗ ngồi
TripSeat.belongsTo(Trip, { foreignKey: 'trip_id', as: 'trip', onDelete: 'RESTRICT' });
Trip.hasMany(TripSeat, { foreignKey: 'trip_id', as: 'seats', onDelete: 'RESTRICT' });

export default TripSeat;
