import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const RouteStop = sequelize.define(
  "RouteStop",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    routeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "route_id",
      references: { model: "routes", key: "id" },
      onDelete: "CASCADE",
    },
    stopName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "stop_name",
      set(value) {
        this.setDataValue("stopName", value ? value.trim() : value);
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    stopType: {
      type: DataTypes.ENUM("pickup", "dropoff", "both"),
      allowNull: false,
      field: "stop_type",
      defaultValue: "both",
    },
    stopOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "stop_order",
    },
    arriveOffsetMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "arrive_offset_minutes",
      defaultValue: 0,
    },
  },
  {
    tableName: "route_stops",
    timestamps: false,
  }
);

export default RouteStop;
