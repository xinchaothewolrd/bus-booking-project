import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Trip from "./Trip.js";

// TripSeat - Quản lý ghế theo từng chuyến xe
// Lifecycle: available → pending (giữ N phút) → booked (đã thanh toán)
const TripSeat = sequelize.define("TripSeat", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tripId: {
    type: DataTypes.INTEGER,
    field: "trip_id",
    allowNull: false,
  },
  seatNumber: {
    type: DataTypes.STRING(10),
    field: "seat_number",
    allowNull: false,
    // VD: "A1", "A2", "B1"
  },
  status: {
    type: DataTypes.ENUM("available", "pending", "booked"),
    defaultValue: "available",
    allowNull: false,
  },
  pendingUntil: {
    type: DataTypes.DATE,
    field: "pending_until",
    allowNull: true,
  },
}, {
  tableName: "trip_seats",
  timestamps: false,
});

// Quan hệ: 1 chuyến xe có nhiều ghế
TripSeat.belongsTo(Trip, { foreignKey: "trip_id", as: "trip",  onDelete: "CASCADE" });
Trip.hasMany(TripSeat,   { foreignKey: "trip_id", as: "seats", onDelete: "CASCADE" });


export default TripSeat;
