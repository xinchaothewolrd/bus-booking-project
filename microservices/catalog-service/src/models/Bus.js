import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import BusType from './BusType.js';

const Bus = sequelize.define('Bus', {
  licensePlate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  driverName: {
    type: DataTypes.STRING(100),
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance'),
    allowNull: false,
    defaultValue: 'active',
  },
  maintenanceNote: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
}, { timestamps: false });

Bus.belongsTo(BusType, { foreignKey: 'busTypeId', as: 'busType' });
BusType.hasMany(Bus, { foreignKey: 'busTypeId', as: 'buses' });

export default Bus;
