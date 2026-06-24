import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';

const BusType = sequelize.define('BusType', {
  typeName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'VD: Limousine 9 chỗ, Giường nằm 40 chỗ',
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seatLayout: {
    type: DataTypes.JSON,
    defaultValue: null,
    comment: 'JSON cấu trúc ghế để Frontend render UI chọn ghế',
  },
}, { timestamps: false });

export default BusType;
