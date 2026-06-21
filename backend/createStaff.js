import bcrypt from 'bcrypt';
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { host: process.env.DB_HOST, dialect: 'mysql', logging: false }
);

const User = sequelize.define('User', {
  fullName: { type: DataTypes.STRING, field: 'full_name' },
  hashedPassword: { type: DataTypes.STRING, field: 'password' },
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  role: DataTypes.STRING,
  status: DataTypes.STRING,
}, { tableName: 'users' });

const run = async () => {
  await sequelize.authenticate();
  const hashedPassword = await bcrypt.hash('123456', 10);
  const [user, created] = await User.findOrCreate({
    where: { email: 'nhanvien@gmail.com' },
    defaults: {
      fullName: 'Nhân Viên 1',
      hashedPassword,
      phone: '0900000001',
      role: 'staff',
      status: 'active',
    },
  });
  if (created) {
    console.log('✅ Tạo tài khoản staff thành công!');
    console.log('   Email: nhanvien@gmail.com');
    console.log('   Mật khẩu: 123456');
    console.log('   Role: staff');
  } else {
    console.log('ℹ️  Tài khoản đã tồn tại:', user.email);
  }
  await sequelize.close();
};

run().catch(console.error);
