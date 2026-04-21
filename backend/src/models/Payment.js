// Payment.js - Model quản lý thanh toán
// 1 Booking có 1 Payment (1-to-1, UNIQUE)

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const Payment = sequelize.define(
  "Payment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: "booking_id", // DB column: booking_id
      references: { model: "bookings", key: "id" },
      onDelete: "CASCADE",
    },
    paymentMethod: {
      type: DataTypes.ENUM("momo", "zalo_pay", "bank_transfer", "cash", "card"),
      allowNull: false,
      field: "payment_method", // DB column: payment_method
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "success", "failed", "refunded"),
      allowNull: false,
      defaultValue: "pending",
    },
    transactionTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "transaction_time", // DB column: transaction_time
    },
  },
  {
    timestamps: true,
    tableName: "payments",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Payment;
