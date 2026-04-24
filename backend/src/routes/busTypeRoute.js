import express from 'express';
import {
  createBusType,
  getAllBusTypes,
  getBusTypeById,
  updateBusType,
  deleteBusType
} from '../controllers/busTypeController.js';

// Import middleware nếu bạn muốn chặn quyền admin (chưa dùng tạm thời)
// import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createBusType);          // Tạo loại xe mới
router.get('/', getAllBusTypes);          // Lấy danh sách toàn bộ loại xe
router.get('/:id', getBusTypeById);       // Lấy 1 loại xe cụ thể
router.put('/:id', updateBusType);        // Cập nhật loại xe
router.delete('/:id', deleteBusType);     // Xóa loại xe

export default router;
