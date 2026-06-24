import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Booking from './Booking.js';

const Payment = sequelize.define('Payment', {
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  method: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'momo', 'vnpay'),
    allowNull: false,
    defaultValue: 'cash',
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending',
  },
  transactionId: {
    type: DataTypes.STRING(100),
    defaultValue: null,
    comment: 'Mã giao dịch từ cổng thanh toán (nếu có)',
  },
  paidAt: {
    type: DataTypes.DATE,
    defaultValue: null,
  },
  note: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
}, { timestamps: true });

Payment.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Booking.hasOne(Payment, { foreignKey: 'bookingId', as: 'payment' });

export default Payment;
