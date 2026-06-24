import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Route from './Route.js';
import BusType from './BusType.js';

const RouteFare = sequelize.define('RouteFare', {
  routeId:    { type: DataTypes.INTEGER, allowNull: false },
  busTypeId:  { type: DataTypes.INTEGER, allowNull: false },
  basePrice:  { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { timestamps: false });

RouteFare.belongsTo(Route,   { foreignKey: 'routeId',   as: 'route'   });
RouteFare.belongsTo(BusType, { foreignKey: 'busTypeId', as: 'busType' });

export default RouteFare;
