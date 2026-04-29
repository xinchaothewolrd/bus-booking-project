import { DataTypes } from "sequelize"; // Import DataTypes từ Sequelize để định nghĩa kiểu dữ liệu cho các trường trong model
import sequelize from "../libs/db.js"; // Đường dẫn tới file db.js đã sửa ở bước trước

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false, // Tương đương với required: true
    unique: true,     // Tương đương với unique: true
    set(value) {      // Tương đương với trim và lowercase
      this.setDataValue('username', value.trim().toLowerCase());
    }
  },
  hashedPassword: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false, // là bắt buộc phải có email
    unique: true, // nghĩa là email cũng phải là duy nhất
    set(value) { // value là giá trị email được truyền vào khi tạo hoặc cập nhật user
      this.setDataValue('email', value.trim().toLowerCase()); // Tự động trim và chuyển email về lowercase khi lưu vào database
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('displayName', value.trim());
    }
  },
  avartarUrl: {
    type: DataTypes.STRING, // link đến ảnh đại diện, có thể là URL hoặc đường dẫn đến file ảnh trên server
  },
  avartarId: {
    type: DataTypes.STRING, // ID của ảnh đại diện trên dịch vụ lưu trữ (nếu sử dụng dịch vụ như Cloudinary)

  },
  bio: {
    type: DataTypes.STRING(500), // Bio,  Giới hạn độ dài của bio
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true, // Số điện thoại có thể để trống
    unique: true, //   Neu muốn số điện thoại cũng phải là duy nhất, bạn có thể thêm unique: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'), // Thêm 'driver' nếu bạn làm app đặt xe/bus
    allowNull: false,
    defaultValue: 'user', // Mặc định khi đăng ký sẽ là user thường
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active', // Hoặc 'pending' nếu bạn muốn họ phải xác thực email mới active
  },
}, {
  timestamps: true, // Tự động tạo createdAt và updatedAt
}
);

export default User;