import { DataTypes, Op } from "sequelize";
import sequelize from "../libs/db.js";

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
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE", // xoá session khi user bị xoá
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    // Scope để dễ dàng lấy các session còn hiệu lực
    scopes: {
      active:() => ({
        where: {
          expiresAt: {
            [Op.gt]: new Date(),
          },
        },
      }),
    },
    indexes: [
      {
        fields: ["userId"],
      },
    ], // Tạo index cho trường expiresAt để tối ưu việc tìm kiếm và xoá các session đã hết hạn
  }
);


// Hàm để xoá các session đã hết hạn, có thể được gọi định kỳ bằng cron job hoặc scheduler
export const cleanupExpiredSessions = async () => {
  try {
    await Session.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    console.log("Expired sessions cleaned up successfully.");
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error);
  }
};

export default Session;