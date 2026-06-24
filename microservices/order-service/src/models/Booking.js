import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';

const Booking = sequelize.define('Booking', {
  // userId tham chiếu sang User Service (không dùng FK thật)
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tham chiếu User trong User Service',
  },
  // tripId tham chiếu sang Trip Service (không dùng FK thật)
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tham chiếu Trip trong Trip Service',
  },
  // Snapshot thông tin tuyến đường tại thời điểm đặt
  tripSnapshot: {
    type: DataTypes.JSON,
    defaultValue: null,
    comment: 'Lưu thông tin chuyến tại thời điểm đặt: route, bus, departureTime...',
  },
  seatNumbers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Danh sách ghế đã đặt, VD: ["A1","A2"]',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  cancelReason: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
}, { timestamps: true });

export default Booking;
