import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Route from "./Route.js";
import BusType from "./BusType.js";
import Bus from "./Bus.js";

const Trip = sequelize.define("Trip", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  routeId: {
    type: DataTypes.INTEGER,
    field: 'route_id',
    allowNull: true // Dựa theo thiết kế SQL là DEFAULT NULL
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    field: 'bus_type_id',
    allowNull: true
  },
  busId: {
    type: DataTypes.INTEGER,
    field: 'bus_id',
    allowNull: true
  },
  departureTime: {
    type: DataTypes.DATE,
    field: 'departure_time',
    allowNull: false
  },
  arrivalTimeExpected: {
    type: DataTypes.DATE,
    field: 'arrival_time_expected',
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'departing', 'completed', 'cancelled'),
    defaultValue: 'scheduled'
  }
}, {
  tableName: 'trips',
  timestamps: false
});

// Quan hệ Khóa Ngoại
Trip.belongsTo(Route, { foreignKey: 'route_id', as: 'route', onDelete: 'RESTRICT' });
Route.hasMany(Trip, { foreignKey: 'route_id', as: 'trips', onDelete: 'RESTRICT' });

Trip.belongsTo(BusType, { foreignKey: 'bus_type_id', as: 'busType', onDelete: 'RESTRICT' });
BusType.hasMany(Trip, { foreignKey: 'bus_type_id', as: 'tripConfigs', onDelete: 'RESTRICT' });

Trip.belongsTo(Bus, { foreignKey: 'bus_id', as: 'bus', onDelete: 'RESTRICT' });
Bus.hasMany(Trip, { foreignKey: 'bus_id', as: 'trips', onDelete: 'RESTRICT' });

export default Trip;
