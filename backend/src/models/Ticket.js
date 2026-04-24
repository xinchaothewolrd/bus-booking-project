// Ticket.js - Model quản lý vé (mỗi vé = 1 ghế + 1 hành khách)
// Thêm: qr_code (mã vé điện tử), status (unused/used/cancelled)

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "booking_id", // DB column: booking_id
      references: { model: "bookings", key: "id" },
      onDelete: "CASCADE",
    },
    tripSeatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "trip_seat_id", // DB column: trip_seat_id
      references: { model: "trip_seats", key: "id" },
      onDelete: "CASCADE",
    },
    passengerName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "passenger_name", // DB column: passenger_name
      set(value) {
        this.setDataValue("passengerName", value ? value.trim() : value);
      },
    },
    passengerPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: "passenger_phone", // DB column: passenger_phone
      set(value) {
        this.setDataValue("passengerPhone", value ? value.trim() : value);
      },
    },
    qrCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      field: "qr_code", // DB column: qr_code
    },
    // Trạng thái vé: unused (chưa lên xe), used (đã check-in), cancelled (đã hủy)
    status: {
      type: DataTypes.ENUM("unused", "used", "cancelled"),
      allowNull: false,
      defaultValue: "unused",
    },
  },
  {
    timestamps: true,
    tableName: "tickets",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Ticket;
