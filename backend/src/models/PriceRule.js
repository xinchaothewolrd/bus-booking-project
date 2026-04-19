// PriceRule.js - Dynamic pricing rules: phụ thu, lễ tết, khuyến mãi
// priority cao hơn → được áp dụng trước

import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";

const PriceRule = sequelize.define(
  "PriceRule",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ruleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "rule_name",
    },
    routeId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = áp dụng tất cả tuyến
      field: "route_id",
      references: { model: "routes", key: "id" },
    },
    busTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = áp dụng tất cả loại xe
      field: "bus_type_id",
      references: { model: "bus_types", key: "id" },
    },
    priceMultiplier: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true, // 1.2 = tăng 20%
      field: "price_multiplier",
    },
    priceDelta: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true, // +50000 hoặc -20000
      field: "price_delta",
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "start_date",
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "end_date",
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "active",
    },
  },
  {
    timestamps: false,
    tableName: "price_rules",
  }
);

export default PriceRule;
