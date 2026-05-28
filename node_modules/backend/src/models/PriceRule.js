import { DataTypes } from "sequelize";
import sequelize from "../libs/db.js";
import Route from "./Route.js";
import BusType from "./BusType.js";

// PriceRule - Luật tăng/giảm giá linh hoạt (lễ tết, sự kiện, khuyến mãi...)
// Ưu tiên cao hơn (priority lớn hơn) sẽ được áp dụng trước
const PriceRule = sequelize.define("PriceRule", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ruleName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: "rule_name",
    // VD: "Tết Nguyên Đán 2025", "Khuyến mãi hè"
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "route_id",
    // null = áp dụng tất cả tuyến
  },
  busTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: "bus_type_id",
    // null = áp dụng tất cả loại xe
  },
  priceMultiplier: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: "price_multiplier",
    // VD: 1.2 = tăng 20%, 0.9 = giảm 10%
  },
  priceDelta: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    field: "price_delta",
    // VD: +50000 hoặc -20000 (cộng/trừ thẳng vào giá)
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
    defaultValue: 1,
    // Rule có priority cao hơn sẽ được áp dụng khi có nhiều rule cùng lúc
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "active", // active | inactive
  },
}, {
  tableName: "price_rules",
  timestamps: false,
});

// Quan hệ (optional - route_id và bus_type_id có thể NULL)
PriceRule.belongsTo(Route,   { foreignKey: "route_id",    as: "route",   onDelete: "SET NULL" });
PriceRule.belongsTo(BusType, { foreignKey: "bus_type_id", as: "busType", onDelete: "SET NULL" });
Route.hasMany(PriceRule,     { foreignKey: "route_id",    as: "priceRules" });
BusType.hasMany(PriceRule,   { foreignKey: "bus_type_id", as: "priceRules" });

export default PriceRule;
