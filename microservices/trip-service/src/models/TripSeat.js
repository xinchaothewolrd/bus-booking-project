import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Trip from './Trip.js';

const TripSeat = sequelize.define('TripSeat', {
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  seatNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'VD: A1, B2, 01, 25...',
  },
  status: {
    type: DataTypes.ENUM('available', 'locked', 'booked'),
    allowNull: false,
    defaultValue: 'available',
    comment: 'locked = đang trong quá trình đặt (timeout 10 phút), booked = đã xác nhận',
  },
  // bookingId tham chiếu sang Order Service (không dùng FK thật)
  bookingId: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    comment: 'Tham chiếu Booking trong Order Service',
  },
  lockedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    comment: 'Thời điểm lock ghế, dùng để auto-release sau 10 phút',
  },
}, {
  timestamps: false,
  indexes: [
    { unique: true, fields: ['tripId', 'seatNumber'] },
  ],
});

// Quan hệ nội bộ Trip Service
TripSeat.belongsTo(Trip, { foreignKey: 'tripId', as: 'trip' });
Trip.hasMany(TripSeat, { foreignKey: 'tripId', as: 'seats' });

export default TripSeat;
