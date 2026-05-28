import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('bus_booking_system', 'root', '040804', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

async function run() {
  try {
    await sequelize.query("UPDATE trip_seats SET status='available'");
    console.log('✅ Reset seats thành công!');
  } catch (error) {
    console.error('Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

run();
