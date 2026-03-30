const express = require('express');
const authController = require('../controllers/authController'); // import authController
const { authenticate, requireRole } = require('../middleware/auth'); // xac thuc va yeu cau role

const router = express.Router(); // tao router express

router.post('/register', authController.register); // goi api register va chay authController.register
router.post('/login', authController.login); // goi api login va chay authController.login
router.get('/me', authenticate, authController.me); // goi api me va chay authController.me
router.get('/admin/ping', authenticate, requireRole('admin'), (req, res) => { // goi api admin/ping va chay authController.admin/ping
  res.json({ ok: true }); // tra ve ok: true
});

module.exports = router; // export router
