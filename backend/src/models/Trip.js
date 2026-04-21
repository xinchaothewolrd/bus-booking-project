// Trip.js - Model quản lý chuyến xe
// 1 Route có nhiều Trip, 1 Trip có nhiều TripSeat và nhiều Booking

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const Trip = sequelize.define(
  "Trip",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    routeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "route_id",
      references: { model: "routes", key: "id" },
      onDelete: "SET NULL",
    },
    busId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "bus_id",
      references: { model: "buses", key: "id" },
      onDelete: "SET NULL",
    },
    departureTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "departure_time",
    },
    arrivalTimeExpected: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "arrival_time_expected",
    },
    status: {
      type: DataTypes.ENUM("scheduled", "departing", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "scheduled",
    },
    cancelPolicy: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cancel_policy",
    },
  },
  {
    timestamps: true,
    tableName: "trips",
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Trip;
