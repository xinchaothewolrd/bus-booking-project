import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import BusType from "./BusType.js"; // Nối với 1 thằng có sẵn (Bảng Loại Xe)

const Bus = sequelize.define("Bus", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  licensePlate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true, // Biển số xe không được trùng
    field: 'license_plate'
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'bus_type_id'
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'retired'),
    allowNull: false,
    defaultValue: 'active'
  },
  maintenanceNote: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'maintenance_note'
  }
}, {
  tableName: 'buses',
  timestamps: false
});

// Khai báo quan hệ dữ liệu cho Sequelize biết
Bus.belongsTo(BusType, { foreignKey: 'bus_type_id', as: 'busType', onDelete: 'RESTRICT' });
BusType.hasMany(Bus, { foreignKey: 'bus_type_id', as: 'buses', onDelete: 'RESTRICT' });

export default Bus;
