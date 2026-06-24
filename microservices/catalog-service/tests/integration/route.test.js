/**
 * INTEGRATION TEST – Route API (/api/routes)
 * ─────────────────────────────────────────────────────────────────
 * Kiểm tra toàn bộ CRUD tuyến đường.
 * Kịch bản:
 *  - POST → Tạo tuyến đường thành công / thiếu dữ liệu
 *  - GET  → Lấy tất cả / lấy theo ID / ID không tồn tại
 *  - PUT  → Cập nhật thành công / không tồn tại
 *  - DELETE → Xóa thành công / không tồn tại
 */

import request   from 'supertest';
import app       from '../../src/app.js';
import sequelize from '../../src/libs/db.js';
import Route     from '../../src/models/Route.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

afterEach(async () => {
  await Route.destroy({ where: {}, truncate: true });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – POST /api/routes', () => {

  test('Tạo tuyến đường thành công với đầy đủ thông tin', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({
        departureLocation: 'Hồ Chí Minh',
        arrivalLocation: 'Đà Lạt',
        distanceKm: 310,
        durationEst: 360,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Tạo tuyến đường thành công.');
    expect(res.body.data).toMatchObject({
      departureLocation: 'Hồ Chí Minh',
      arrivalLocation: 'Đà Lạt',
      distanceKm: 310,
      durationEst: 360,
    });
  });

  test('Tạo tuyến đường chỉ với 2 field bắt buộc (không có distance/duration)', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ departureLocation: 'Hà Nội', arrivalLocation: 'Hải Phòng' });

    expect(res.status).toBe(201);
    expect(res.body.data.distanceKm).toBeNull();
    expect(res.body.data.durationEst).toBeNull();
  });

  test('Thiếu departureLocation → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ arrivalLocation: 'Đà Nẵng' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Thiếu điểm đi');
  });

  test('Thiếu arrivalLocation → HTTP 400', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send({ departureLocation: 'Hồ Chí Minh' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('điểm đến');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/routes', () => {

  test('Trả về mảng rỗng khi chưa có dữ liệu', async () => {
    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test('Trả về đúng số lượng tuyến đường đã tạo', async () => {
    await Route.bulkCreate([
      { departureLocation: 'HCM', arrivalLocation: 'Đà Lạt' },
      { departureLocation: 'HCM', arrivalLocation: 'Nha Trang' },
      { departureLocation: 'HCM', arrivalLocation: 'Vũng Tàu' },
    ]);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(3);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – GET /api/routes/:id', () => {

  test('Lấy đúng thông tin tuyến đường theo ID', async () => {
    const created = await Route.create({
      departureLocation: 'HCM',
      arrivalLocation: 'Đà Lạt',
      distanceKm: 310,
    });

    const res = await request(app).get(`/api/routes/${created.id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created.id);
    expect(res.body.departureLocation).toBe('HCM');
    expect(res.body.arrivalLocation).toBe('Đà Lạt');
    expect(res.body.distanceKm).toBe(310);
  });

  test('Trả về 404 khi ID không tồn tại', async () => {
    const res = await request(app).get('/api/routes/99999');

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Không tìm thấy tuyến đường');
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – PUT /api/routes/:id', () => {

  test('Cập nhật khoảng cách và thời gian ước tính thành công', async () => {
    const created = await Route.create({
      departureLocation: 'HCM',
      arrivalLocation: 'Đà Lạt',
      distanceKm: 300,
      durationEst: 360,
    });

    const res = await request(app)
      .put(`/api/routes/${created.id}`)
      .send({ distanceKm: 315, durationEst: 380 });

    expect(res.status).toBe(200);
    expect(res.body.data.distanceKm).toBe(315);
    expect(res.body.data.durationEst).toBe(380);
  });

  test('Trả về 404 khi cập nhật ID không tồn tại', async () => {
    const res = await request(app)
      .put('/api/routes/99999')
      .send({ distanceKm: 200 });

    expect(res.status).toBe(404);
  });
});

// ═══════════════════════════════════════════════════════════════════
describe('Integration Test – DELETE /api/routes/:id', () => {

  test('Xóa tuyến đường và kiểm tra đã bị xóa khỏi DB', async () => {
    const created = await Route.create({
      departureLocation: 'HCM',
      arrivalLocation: 'Cần Thơ',
    });

    const deleteRes = await request(app).delete(`/api/routes/${created.id}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('Xóa tuyến đường thành công');

    // Xác nhận không còn trong DB
    const getRes = await request(app).get(`/api/routes/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  test('Trả về 404 khi xóa ID không tồn tại', async () => {
    const res = await request(app).delete('/api/routes/99999');
    expect(res.status).toBe(404);
  });
});
