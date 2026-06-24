/**
 * INTEGRATION TEST – BusType API (/api/bus-types)
 * ─────────────────────────────────────────────────────────────────
 * Test này gọi thật đến Express app và thật đến database MySQL test.
 * Yêu cầu: Database test đang chạy và biến môi trường trong .env.test đã cấu hình.
 *
 * Các kịch bản kiểm tra:
 *  - POST /api/bus-types     → Tạo loại xe thành công
 *  - POST /api/bus-types     → Thiếu field bắt buộc → lỗi 400
 *  - GET  /api/bus-types     → Lấy danh sách
 *  - GET  /api/bus-types/:id → Lấy theo ID
 *  - GET  /api/bus-types/:id → ID không tồn tại → lỗi 404
 *  - PUT  /api/bus-types/:id → Cập nhật thành công
 *  - DELETE /api/bus-types/:id → Xóa thành công
 */

import request  from 'supertest';
import app      from '../../src/app.js';
import sequelize from '../../src/libs/db.js';
import BusType  from '../../src/models/BusType.js';

// Chạy trước toàn bộ test: đồng bộ DB và xoá dữ liệu cũ
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Tạo lại bảng sạch
});

// Dọn dẹp sau khi xong
afterAll(async () => {
  await sequelize.close();
});

// Xoá dữ liệu BusType sau mỗi test để tránh ảnh hưởng lẫn nhau
afterEach(async () => {
  await BusType.destroy({ where: {}, truncate: true });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – POST /api/bus-types', () => {

  test('Tạo loại xe thành công với đầy đủ thông tin', async () => {
    const res = await request(app)
      .post('/api/bus-types')
      .send({ typeName: 'Limousine 9 chỗ', totalSeats: 9 });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Tạo loại xe thành công.');
    expect(res.body.data).toMatchObject({
      typeName: 'Limousine 9 chỗ',
      totalSeats: 9,
    });
    // Phải có id được tạo tự động
    expect(res.body.data.id).toBeDefined();
  });

  test('Tạo loại xe thất bại khi thiếu typeName → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bus-types')
      .send({ totalSeats: 40 }); // Thiếu typeName

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Thiếu typeName');
  });

  test('Tạo loại xe thất bại khi thiếu totalSeats → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/bus-types')
      .send({ typeName: 'Xe giường nằm' }); // Thiếu totalSeats

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('totalSeats');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/bus-types', () => {

  test('Lấy danh sách khi chưa có dữ liệu → trả về mảng rỗng', async () => {
    const res = await request(app).get('/api/bus-types');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('Lấy danh sách sau khi tạo → trả về đúng số lượng bản ghi', async () => {
    // Tạo sẵn 2 loại xe trong DB
    await BusType.bulkCreate([
      { typeName: 'Xe 16 chỗ', totalSeats: 16 },
      { typeName: 'Giường nằm 40 chỗ', totalSeats: 40 },
    ]);

    const res = await request(app).get('/api/bus-types');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/bus-types/:id', () => {

  test('Lấy đúng loại xe theo ID', async () => {
    const created = await BusType.create({ typeName: 'Limousine', totalSeats: 9 });

    const res = await request(app).get(`/api/bus-types/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.typeName).toBe('Limousine');
  });

  test('Trả về 404 khi ID không tồn tại', async () => {
    const res = await request(app).get('/api/bus-types/99999');

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Không tìm thấy');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – PUT /api/bus-types/:id', () => {

  test('Cập nhật tên loại xe thành công', async () => {
    const created = await BusType.create({ typeName: 'Xe cũ', totalSeats: 30 });

    const res = await request(app)
      .put(`/api/bus-types/${created.id}`)
      .send({ typeName: 'Xe mới nâng cấp' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Cập nhật thành công.');
    expect(res.body.data.typeName).toBe('Xe mới nâng cấp');
  });

  test('Trả về 404 khi cập nhật ID không tồn tại', async () => {
    const res = await request(app)
      .put('/api/bus-types/99999')
      .send({ typeName: 'Test' });

    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – DELETE /api/bus-types/:id', () => {

  test('Xóa loại xe thành công và không thể GET lại', async () => {
    const created = await BusType.create({ typeName: 'Xe cần xóa', totalSeats: 10 });

    // Xóa
    const deleteRes = await request(app).delete(`/api/bus-types/${created.id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toBe('Xóa loại xe thành công.');

    // Kiểm tra xem còn trong DB không
    const getRes = await request(app).get(`/api/bus-types/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  test('Trả về 404 khi xóa ID không tồn tại', async () => {
    const res = await request(app).delete('/api/bus-types/99999');
    expect(res.status).toBe(404);
  });
});
