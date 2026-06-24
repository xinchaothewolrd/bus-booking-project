/**
 * Xử lý lỗi Sequelize và trả về message rõ ràng thay vì "Lỗi hệ thống."
 */
export function handleDbError(res, e) {
  if (e.name === 'SequelizeUniqueConstraintError') {
    const field = e.errors?.[0]?.path || 'trường';
    const value = e.errors?.[0]?.value || '';
    return res.status(409).json({ message: `Giá trị '${value}' đã tồn tại trong trường '${field}'. Vui lòng dùng giá trị khác.` });
  }
  if (e.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'ID tham chiếu không tồn tại. Kiểm tra lại busTypeId, routeId, v.v.' });
  }
  if (e.name === 'SequelizeValidationError') {
    const messages = e.errors.map(err => err.message).join(', ');
    return res.status(400).json({ message: `Dữ liệu không hợp lệ: ${messages}` });
  }
  console.error('[DB Error]', e.message);
  return res.status(500).json({ message: 'Lỗi hệ thống.', error: e.message });
}
