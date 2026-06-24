/**
 * INTEGRATION TEST – Bus API (/api/buses)
 * ─────────────────────────────────────────────────────────────────
 * Bus phụ thuộc BusType (foreign key busTypeId).
 * Test sẽ tạo BusType trước, sau đó test CRUD Bus.
 *
 * Kịch bản:
 *  - POST → Tạo xe thành công / thiếu biển số / thiếu loại xe
 *  - POST → Biển số trùng → 409
 *  - GET  → Lấy danh sách kèm thông tin BusType (include)
 *  - GET  → Lấy theo ID / không tồn tại
 *  - PUT  → Cập nhật trạng thái xe (maintenance)
 *  - DELETE → Xóa xe
 */

import request   from 'supertest';
import app       from '../../src/app.js';
import sequelize from '../../src/libs/db.js';
import BusType   from '../../src/models/BusType.js';
import Bus       from '../../src/models/Bus.js';

let sharedBusTypeId; // ID BusType dùng chung trong tất cả test

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Tạo 1 BusType để Bus có thể tham chiếu
  const bt = await BusType.create({ typeName: 'Limousine 9 chỗ', totalSeats: 9 });
  sharedBusTypeId = bt.id;
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  // Chỉ xóa Bus sau mỗi test, giữ nguyên BusType
  await Bus.destroy({ where: {}, truncate: true });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – POST /api/buses', () => {

  test('Tạo xe thành công với biển số và loại xe hợp lệ', async () => {
    const res = await request(app)
      .post('/api/buses')
      .send({
        licensePlate: '51A-123.45',
        busTypeId: sharedBusTypeId,
        driverName: 'Nguyễn Văn A',
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Thêm xe thành công.');
    expect(res.body.data.licensePlate).toBe('51A-123.45');
    expect(res.body.data.status).toBe('active'); // Giá trị mặc định
  });

  test('Thiếu licensePlate → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/buses')
      .send({ busTypeId: sharedBusTypeId });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Thiếu biển số');
  });

  test('Thiếu busTypeId → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/buses')
      .send({ licensePlate: '51B-999.99' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('loại xe');
  });

  test('Biển số xe đã tồn tại (unique) → HTTP 409', async () => {
    // Tạo xe lần đầu
    await Bus.create({ licensePlate: '51A-000.01', busTypeId: sharedBusTypeId });

    // Tạo xe lần 2 với cùng biển số
    const res = await request(app)
      .post('/api/buses')
      .send({ licensePlate: '51A-000.01', busTypeId: sharedBusTypeId });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('51A-000.01');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/buses', () => {

  test('Danh sách xe bao gồm thông tin BusType (include)', async () => {
    await Bus.create({ licensePlate: '51A-111.11', busTypeId: sharedBusTypeId });

    const res = await request(app).get('/api/buses');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    // Phải trả về kèm thông tin busType
    expect(res.body[0].busType).toBeDefined();
    expect(res.body[0].busType.typeName).toBe('Limousine 9 chỗ');
  });

  test('Danh sách rỗng khi chưa có xe', async () => {
    const res = await request(app).get('/api/buses');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/buses/:id', () => {

  test('Lấy xe theo ID kèm thông tin loại xe', async () => {
    const bus = await Bus.create({
      licensePlate: '51A-222.22',
      busTypeId: sharedBusTypeId,
      driverName: 'Trần Văn B',
    });

    const res = await request(app).get(`/api/buses/${bus.id}`);

    expect(res.status).toBe(200);
    expect(res.body.licensePlate).toBe('51A-222.22');
    expect(res.body.driverName).toBe('Trần Văn B');
    expect(res.body.busType.id).toBe(sharedBusTypeId);
  });

  test('Trả về 404 khi ID không tồn tại', async () => {
    const res = await request(app).get('/api/buses/99999');
    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Không tìm thấy xe');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – PUT /api/buses/:id', () => {

  test('Cập nhật trạng thái xe sang maintenance', async () => {
    const bus = await Bus.create({
      licensePlate: '51A-333.33',
      busTypeId: sharedBusTypeId,
    });

    const res = await request(app)
      .put(`/api/buses/${bus.id}`)
      .send({ status: 'maintenance', maintenanceNote: 'Thay lốp xe' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('maintenance');
    expect(res.body.data.maintenanceNote).toBe('Thay lốp xe');
  });

  test('Trả về 404 khi cập nhật xe không tồn tại', async () => {
    const res = await request(app)
      .put('/api/buses/99999')
      .send({ status: 'active' });
    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – DELETE /api/buses/:id', () => {

  test('Xóa xe thành công', async () => {
    const bus = await Bus.create({
      licensePlate: '51A-444.44',
      busTypeId: sharedBusTypeId,
    });

    const deleteRes = await request(app).delete(`/api/buses/${bus.id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('Xóa xe thành công');

    const getRes = await request(app).get(`/api/buses/${bus.id}`);
    expect(getRes.status).toBe(404);
  });
});
