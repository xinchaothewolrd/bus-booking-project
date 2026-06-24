import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';

const Route = sequelize.define('Route', {
  departureLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  arrivalLocation: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  distanceKm: {
    type: DataTypes.INTEGER,
    defaultValue: null,
  },
  durationEst: {
    type: DataTypes.INTEGER,   // số phút ước tính (vd: 360 = 6 tiếng)
    defaultValue: null,
  },
}, { timestamps: false });

export default Route;
