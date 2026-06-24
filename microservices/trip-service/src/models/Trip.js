import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';

const Trip = sequelize.define('Trip', {
  // routeId & busId là tham chiếu sang Catalog Service (không dùng FK thật)
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tham chiếu Route trong Catalog Service',
  },
  busId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tham chiếu Bus trong Catalog Service',
  },
  departureTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  // Giá vé cơ bản của chuyến này (copy từ RouteFare khi tạo chuyến)
  basePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Số ghế còn trống (tự tính, cập nhật khi đặt/huỷ)',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'ongoing', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled',
  },
  note: {
    type: DataTypes.STRING(255),
    defaultValue: null,
  },
}, { timestamps: true });

export default Trip;
