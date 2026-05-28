import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Route from "./Route.js";
import Bus from "./Bus.js";

const Trip = sequelize.define("Trip", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  routeId: {
    type: DataTypes.INTEGER,
    field: "route_id",
    allowNull: true,
  },
  busId: {
    type: DataTypes.INTEGER,
    field: "bus_id",
    allowNull: true,
    // Biết chính xác xe + tài xế nào chạy chuyến này
  },
  departureTime: {
    type: DataTypes.DATE,
    field: "departure_time",
    allowNull: false,
  },
  arrivalTimeExpected: {
    type: DataTypes.DATE,
    field: "arrival_time_expected",
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("scheduled", "departing", "completed", "cancelled"),
    defaultValue: "scheduled",
  },
  cancelPolicy: {
    type: DataTypes.TEXT,
    field: "cancel_policy",
    allowNull: true,
  },
}, {
  tableName: "trips",
  timestamps: false,
});

// Quan hệ: Chuyến xe thuộc 1 tuyến đường
Trip.belongsTo(Route, { foreignKey: "route_id", as: "route", onDelete: "RESTRICT" });
Route.hasMany(Trip,   { foreignKey: "route_id", as: "trips", onDelete: "RESTRICT" });

// Quan hệ: Chuyến xe dùng 1 xe cụ thể
Trip.belongsTo(Bus, { foreignKey: "bus_id", as: "bus", onDelete: "RESTRICT" });
Bus.hasMany(Trip,   { foreignKey: "bus_id", as: "trips", onDelete: "RESTRICT" });


export default Trip;
