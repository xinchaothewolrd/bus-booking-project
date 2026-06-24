// TripSeat.js - Model quản lý ghế theo chuyến xe
// Lifecycle: available → pending (giữ 10 phút) → booked (đã thanh toán)

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const TripSeat = sequelize.define(
  "TripSeat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "trip_id", // DB column: trip_id
      references: { model: "trips", key: "id" },
      onDelete: "CASCADE",
    },
    seatNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: "seat_number", // DB column: seat_number
    },
    status: {
      type: DataTypes.ENUM("available", "pending", "booked"),
      allowNull: false,
      defaultValue: "available",
    },
    pendingUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "pending_until", // DB column: pending_until
    },
  },
  {
    timestamps: true,
    tableName: "trip_seats",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default TripSeat;
