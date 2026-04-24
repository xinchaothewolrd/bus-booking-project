import { DataTypes, Op } from "sequelize";
import sequelize from "../libs/db.js";
import User from "./User.js";

const Session = sequelize.define(
  "Session",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id", // DB column: user_id
      references: { model: User, key: "id" },
      onDelete: "CASCADE",
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "refresh_token", // DB column: refresh_token
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at", // DB column: expires_at
    },
  },
  {
    timestamps: true,
    tableName: "sessions",
    createdAt: "created_at",
    updatedAt: "updated_at",
    scopes: {
      active: () => ({
        where: {
          expiresAt: { [Op.gt]: new Date() },
        },
      }),
    },
    indexes: [{ fields: ["user_id"] }],
  }
);

export const cleanupExpiredSessions = async () => {
  try {
    await Session.destroy({
      where: { expiresAt: { [Op.lt]: new Date() } },
    });
    console.log("Expired sessions cleaned up successfully.");
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
};

export default Session;