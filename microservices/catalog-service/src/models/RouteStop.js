import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Route from './Route.js';

const RouteStop = sequelize.define('RouteStop', {
  routeId: { type: DataTypes.INTEGER, allowNull: false },
  stopName: { type: DataTypes.STRING(255), allowNull: false },
  address: { type: DataTypes.STRING(255), defaultValue: null },
  stopType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'pickup, dropoff, both',
  },
  stopOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Thứ tự dừng: 1, 2, 3...',
  },
  arriveOffsetMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Cách giờ xuất phát bao nhiêu phút',
  },
}, { timestamps: false });

RouteStop.belongsTo(Route, { foreignKey: 'routeId', as: 'route' });
Route.hasMany(RouteStop, { foreignKey: 'routeId', as: 'stops' });

export default RouteStop;
