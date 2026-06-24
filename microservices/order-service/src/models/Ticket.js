import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';
import Booking from './Booking.js';

const Ticket = sequelize.define('Ticket', {
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ticketCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Mã vé duy nhất (UUID), dùng để kiểm tra khi lên xe',
  },
  seatNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  passengerName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  passengerPhone: {
    type: DataTypes.STRING(20),
    defaultValue: null,
  },
  passengerEmail: {
    type: DataTypes.STRING(100),
    defaultValue: null,
  },
  status: {
    type: DataTypes.ENUM('active', 'used', 'cancelled'),
    allowNull: false,
    defaultValue: 'active',
  },
}, { timestamps: true });

Ticket.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Booking.hasMany(Ticket, { foreignKey: 'bookingId', as: 'tickets' });

export default Ticket;
