// RouteFare.js - Bảng giá vé cơ bản theo tuyến đường + loại xe
// Ví dụ: Sài Gòn - Đà Lạt + Giường nằm = 300.000đ

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const RouteFare = sequelize.define(
  "RouteFare",
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
    },
    busTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "bus_type_id",
      references: { model: "bus_types", key: "id" },
    },
    basePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "base_price",
    },
  },
  {
    timestamps: false,
    tableName: "route_fares",
  }
);

export default RouteFare;
