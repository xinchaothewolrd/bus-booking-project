import e from 'express';
import express from 'express';
import { authMe } from '../controllers/userController.js'; // Import hàm authMe từ userController

const router = express.Router(); // Định nghĩa route

router.get('/me', authMe); //  Định nghĩa route GET /me và gán hàm authMe làm handler (bạn cần định nghĩa hàm authMe trong userController.js)


export default router;