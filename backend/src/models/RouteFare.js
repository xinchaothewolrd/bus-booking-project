
import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Route from "./Route.js";
import BusType from "./BusType.js";

// RouteFare - Giá vé gốc theo tuyến đường + loại xe
// Mỗi cặp (route_id, bus_type_id) chỉ có 1 giá gốc (unique index trong DB)
const RouteFare = sequelize.define("RouteFare", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "route_id",
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "bus_type_id",
  },
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    field: "base_price",
    // VD: 300000 (300.000đ)
  },
}, {
  tableName: "route_fares",
  timestamps: false,
});

// Quan hệ
RouteFare.belongsTo(Route,   { foreignKey: "route_id",    as: "route",   onDelete: "RESTRICT" });
RouteFare.belongsTo(BusType, { foreignKey: "bus_type_id", as: "busType", onDelete: "RESTRICT" });
Route.hasMany(RouteFare,     { foreignKey: "route_id",    as: "fares" });
BusType.hasMany(RouteFare,   { foreignKey: "bus_type_id", as: "fares" });


export default RouteFare;
