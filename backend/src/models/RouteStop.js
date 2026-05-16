import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Route from "./Route.js";

const RouteStop = sequelize.define("RouteStop", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'route_id'
  },
  stopName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'stop_name'
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  stopType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'stop_type'
  },
  stopOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'stop_order'
  },
  arriveOffsetMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'arrive_offset_minutes'
  }
}, {
  tableName: 'route_stops',
  timestamps: false
});

// Thiết lập quan hệ
Route.hasMany(RouteStop, { foreignKey: 'routeId', as: 'stops' });
RouteStop.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });

export default RouteStop;
