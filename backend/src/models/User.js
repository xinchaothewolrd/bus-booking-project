import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const User = sequelize.define("User", {
  hashedPassword: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "password", // DB column: password
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue("email", value.trim().toLowerCase());
    },
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: "full_name", // DB column: full_name
    set(value) {
      this.setDataValue("fullName", value.trim());
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "customer", // admin | customer | staff
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "active", // active | banned
  },
}, {
  timestamps: true,
  tableName: "users",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
});

export default User;