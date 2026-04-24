// Booking.js - Model quản lý đặt vé
import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const Booking = sequelize.define(
  "Booking",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id", // DB column: user_id
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "trip_id", // DB column: trip_id
      references: { model: "trips", key: "id" },
      onDelete: "CASCADE",
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: "total_amount", // DB column: total_amount
    },
    status: {
      type: DataTypes.ENUM("pending", "paid", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
    bookingTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "booking_time", // DB column: booking_time
    },
  },
  {
    timestamps: true,
    tableName: "bookings",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Booking;
