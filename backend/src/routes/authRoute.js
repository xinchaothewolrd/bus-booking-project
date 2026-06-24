import express from 'express';
import { signUp, signIn, signOut, refreshToken } from '../controllers/authController.js'; // Import hàm signUp từ authController
const router = express.Router(); // Định nghĩa route

router.post("/signup", signUp); // Định nghĩa route POST /signup và gán hàm signUp làm handler

router.post("/signin", signIn); // Định nghĩa route POST /signin và gán hàm signIn làm handler (bạn cần định nghĩa hàm signIn trong authController.js)

router.post("/signout", signOut); // Định nghĩa route POST /signout và gán hàm signOut làm handler (bạn cần định nghĩa hàm signOut trong authController.js)

router.post("/refresh", refreshToken); // Dùng refreshToken trong cookie để lấy accessToken mới

export default router;


