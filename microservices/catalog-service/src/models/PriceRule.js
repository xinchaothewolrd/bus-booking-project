import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Route from './Route.js';
import BusType from './BusType.js';

const PriceRule = sequelize.define('PriceRule', {
  ruleName:        { type: DataTypes.STRING(100), allowNull: false },
  routeId:         { type: DataTypes.INTEGER, defaultValue: null },
  busTypeId:       { type: DataTypes.INTEGER, defaultValue: null },
  priceMultiplier: { type: DataTypes.DECIMAL(5, 2), defaultValue: null },
  priceDelta:      { type: DataTypes.DECIMAL(12, 2), defaultValue: null },
  startDate:       { type: DataTypes.DATE, allowNull: false },
  endDate:         { type: DataTypes.DATE, allowNull: false },
  priority:        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  status:          { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'active' },
}, { timestamps: false });

PriceRule.belongsTo(Route,   { foreignKey: 'routeId',   as: 'route'   });
PriceRule.belongsTo(BusType, { foreignKey: 'busTypeId', as: 'busType' });

export default PriceRule;
