/**
 * UNIT TEST - handleDbError.js
 * ─────────────────────────────────────────────────────────────────
 * Kiểm tra hàm xử lý lỗi Sequelize.
 * Đây là Unit Test thuần: KHÔNG cần kết nối database, KHÔNG cần Express server.
 * Chỉ kiểm tra logic của 1 hàm độc lập.
 */

import { handleDbError } from '../../src/libs/handleDbError.js';

// Tạo mock object giả lập res của Express
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res); // cho phép gọi chuỗi res.status(x).json(y)
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('Unit Test – handleDbError()', () => {

  // ────────────────────────────────────────────────────────────────
  // Test 1: Lỗi trùng lặp dữ liệu (biển số xe đã tồn tại)
  // ────────────────────────────────────────────────────────────────
  test('Trả về 409 khi gặp lỗi SequelizeUniqueConstraintError', () => {
    const res = mockRes();
    const fakeError = {
      name: 'SequelizeUniqueConstraintError',
      errors: [{ path: 'licensePlate', value: '51A-123.45' }],
    };

    handleDbError(res, fakeError);

    // Kiểm tra status code trả về là 409
    expect(res.status).toHaveBeenCalledWith(409);
    // Kiểm tra message có chứa giá trị bị trùng
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('51A-123.45') })
    );
  });

  // ────────────────────────────────────────────────────────────────
  // Test 2: Lỗi khóa ngoại (busTypeId không tồn tại)
  // ────────────────────────────────────────────────────────────────
  test('Trả về 400 khi gặp lỗi SequelizeForeignKeyConstraintError', () => {
    const res = mockRes();
    const fakeError = { name: 'SequelizeForeignKeyConstraintError' };

    handleDbError(res, fakeError);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('ID tham chiếu không tồn tại') })
    );
  });

  // ────────────────────────────────────────────────────────────────
  // Test 3: Lỗi dữ liệu không hợp lệ (validation)
  // ────────────────────────────────────────────────────────────────
  test('Trả về 400 khi gặp lỗi SequelizeValidationError', () => {
    const res = mockRes();
    const fakeError = {
      name: 'SequelizeValidationError',
      errors: [{ message: 'typeName cannot be null' }],
    };

    handleDbError(res, fakeError);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('typeName cannot be null') })
    );
  });

  // ────────────────────────────────────────────────────────────────
  // Test 4: Lỗi không xác định → trả về 500
  // ────────────────────────────────────────────────────────────────
  test('Trả về 500 cho các lỗi khác không xác định', () => {
    const res = mockRes();
    const fakeError = { name: 'UnknownError', message: 'Lỗi bí ẩn' };

    handleDbError(res, fakeError);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Lỗi hệ thống.' })
    );
  });
});
