# 🚌 Bus Booking API — Cheat Sheet Test Postman

**Base URL:** `http://localhost:3000/api`
**Header chung (mọi route cần login):** `Authorization: Bearer <token>`

---

## 💡 Giải thích luồng Payment

```
Khách tạo booking
  → Hệ thống tự sinh: 1 Payment (pending) + 1 QR code (để check-in xe)
  → Khách chuyển khoản / đến quầy nộp tiền thật
  → Admin vào hệ thống xác nhận → approve payment
  → Booking = paid, ghế = booked
  → Khách dùng QR check-in lên xe (staff quét)
```

> ⚠️ QR code KHÔNG phải để thanh toán. Nó dùng để nhân viên quét xác nhận hành khách lên xe.

---

## ⚠️ Cần có sẵn trong DB trước khi test

```sql
-- Tạo trip (giờ khởi hành phải > hiện tại)
INSERT INTO trips (route_id, bus_id, departure_time, arrival_time_expected, status)
VALUES (1, 1, '2026-12-01 08:00:00', '2026-12-01 14:00:00', 'scheduled');

-- Tạo ghế cho trip đó
INSERT INTO trip_seats (trip_id, seat_number, status)
VALUES (1, 'A01', 'available'),
       (1, 'A02', 'available'),
       (1, 'A03', 'available');

-- Set role admin (sau khi signup)
UPDATE users SET role='admin' WHERE email='admin@test.com';

-- Set role staff (sau khi signup)
UPDATE users SET role='staff' WHERE email='staff@test.com';
```

---

## 🔐 AUTH

### Đăng ký tài khoản
```
POST http://localhost:3000/api/auth/signup
```
```json
{
  "firstName": "Hồ",
  "lastName": "Minh Khoa",
  "email": "customer@test.com",
  "phone": "0901234567",
  "password": "123456"
}
```
> ✅ Trả về: `204 No Content` là thành công

---

### Đăng nhập (dùng cho mọi role)
```
POST http://localhost:3000/api/auth/signin
```
```json
{
  "identity": "customer@test.com",
  "password": "123456"
}
```
> ⚠️ Field là `identity` (không phải `email`). Có thể nhập email hoặc số điện thoại đều được.
> ✅ Trả về: `{ "accessToken": "eyJ..." }` — copy token này paste vào header Authorization

---

### Đăng nhập admin
```
POST http://localhost:3000/api/auth/signin
```
```json
{
  "identity": "admin@test.com",
  "password": "admin123"
}
```

---

### Đăng nhập staff
```
POST http://localhost:3000/api/auth/signin
```
```json
{
  "identity": "staff@test.com",
  "password": "123456"
}
```

---

### Xem thông tin user đang login
```
GET http://localhost:3000/api/users/me
Authorization: Bearer <token>
```
> Không cần body

---

### Đăng xuất
```
POST http://localhost:3000/api/auth/signout
Authorization: Bearer <token>
```
> Không cần body

---

## 🎫 BOOKING

### Tạo booking mới (đặt 1 ghế)
```
POST http://localhost:3000/api/bookings
Authorization: Bearer <token>
```
```json
{
  "userId": 14,
  "tripId": 1,
  "totalAmount": 330000,
  "tickets": [
    {
      "tripSeatId": 3,
      "passengerName": "Hồ Minh Khoa",
      "passengerPhone": "0123456789"
    }
  ]
}
```
> ✅ Sau khi tạo thành công, response trả về `data.Payment.id` (lưu lại để dùng bước approve)
> ✅ `data.Tickets[0].qrCode` = mã QR để check-in

---

### Tạo booking nhiều ghế
```
POST http://localhost:3000/api/bookings
Authorization: Bearer <token>
```
```json
{
  "userId": 14,
  "tripId": 1,
  "totalAmount": 660000,
  "tickets": [
    {
      "tripSeatId": 1,
      "passengerName": "Hồ Minh Khoa",
      "passengerPhone": "0123456789"
    },
    {
      "tripSeatId": 2,
      "passengerName": "Nguyễn Văn B",
      "passengerPhone": "0987654321"
    }
  ]
}
```

---

### Lấy danh sách tất cả bookings (Admin only)
```
GET http://localhost:3000/api/bookings?status=pending
Authorization: Bearer <admin_token>
```
> Query params (tuỳ chọn): `status=pending|paid|cancelled`, `userId=1`, `tripId=1`
> Customer sẽ bị 403

---

### Lấy booking theo ID
```
GET http://localhost:3000/api/bookings/5
Authorization: Bearer <token>
```
> Thay `5` bằng bookingId thực tế. Không cần body.

---

### Lấy bookings của 1 user
```
GET http://localhost:3000/api/bookings/user/14
Authorization: Bearer <token>
```
> Thay `14` bằng userId. Response phân loại: `upcoming`, `completed`, `cancelled`

---

### Hủy booking (user tự hủy)
```
POST http://localhost:3000/api/bookings/5/cancel
Authorization: Bearer <token>
```
```json
{}
```
> ⚠️ Chỉ hủy được nếu còn hơn 24 giờ trước giờ khởi hành
> Sau khi hủy: ghế được nhả về `available`, vé chuyển `cancelled`

---

### Cập nhật booking (Admin)
```
PUT http://localhost:3000/api/bookings/5
Authorization: Bearer <admin_token>
```
```json
{
  "status": "paid"
}
```

---

### Xóa booking (Admin)
```
DELETE http://localhost:3000/api/bookings/5
Authorization: Bearer <admin_token>
```
> Không cần body. Không xóa được booking đã `paid`.

---

## 💳 PAYMENT

> **Nhớ:** Payment được tạo tự động khi tạo booking (method='cash', status='pending').
> Lấy `paymentId` từ response của bước tạo booking hoặc từ GET payment by booking.

---

### Lấy payment của booking
```
GET http://localhost:3000/api/payments/booking/5
Authorization: Bearer <token>
```
> Thay `5` bằng bookingId. Không cần body.

---

### Lấy tất cả payments (Admin)
```
GET http://localhost:3000/api/payments?status=pending
Authorization: Bearer <admin_token>
```
> Query params: `status=pending|success|failed|refunded`, `paymentMethod=cash|momo|zalo_pay|bank_transfer|card`

---

### ✅ Phê duyệt payment — Admin xác nhận khách đã chuyển tiền
```
POST http://localhost:3000/api/payments/3/approve
Authorization: Bearer <admin_token>
```
```json
{}
```
> Thay `3` bằng paymentId
> Sau khi approve: `payment=success`, `booking=paid`, `tripSeat=booked`

---

### ❌ Từ chối payment (Admin)
```
POST http://localhost:3000/api/payments/3/reject
Authorization: Bearer <admin_token>
```
```json
{}
```
> Payment phải đang ở trạng thái `pending`

---

### 💸 Hoàn tiền (Admin)
```
POST http://localhost:3000/api/payments/3/refund
Authorization: Bearer <admin_token>
```
```json
{
  "refundReason": "Khách yêu cầu hủy chuyến"
}
```
> Payment phải đang ở trạng thái `success`
> Sau khi refund: `payment=refunded`, `booking=cancelled`, `ticket=cancelled`, ghế được nhả

---

## 🎟️ TICKET

### Xem vé điện tử của booking
```
GET http://localhost:3000/api/tickets/booking/5
Authorization: Bearer <token>
```
> Thay `5` bằng bookingId. Trả về đầy đủ: thông tin chuyến, vé, mã QR, payment.

---

### Lấy tất cả tickets (Admin)
```
GET http://localhost:3000/api/tickets
Authorization: Bearer <admin_token>
```

---

### Lấy ticket theo ID (Admin)
```
GET http://localhost:3000/api/tickets/7
Authorization: Bearer <admin_token>
```

---

## 🏷️ STAFF CHECK-IN

> **Yêu cầu:** Dùng token của `staff` hoặc `admin`.
> **Điều kiện:** Booking phải là `paid`, ticket phải là `unused`.

---

### Bước 1 — Tìm vé bằng QR code
```
GET http://localhost:3000/api/tickets/check/A1B2C3D4E5F6ABCDEF1234567890ABCD
Authorization: Bearer <staff_token>
```
> Thay QR code bằng mã thực tế (32 ký tự uppercase) từ response tạo booking.
> Không cần body.

---

### Bước 2 — Check-in hành khách (unused → used)
```
PATCH http://localhost:3000/api/tickets/7/checkin
Authorization: Bearer <staff_token>
```
```json
{}
```
> Thay `7` bằng ticketId.
> ✅ Trả về: `"Check-in thành công! Hành khách ... đã lên xe."`

---

## 🔒 TEST PHÂN QUYỀN

| Test | Method | URL | Token | Kết quả mong đợi |
|------|--------|-----|-------|------------------|
| Không có token | GET | `/api/bookings` | (không có) | `401` |
| Token sai | GET | `/api/bookings` | `Bearer abc123` | `403` |
| Customer vào admin route | GET | `/api/bookings` | customer token | `403` |
| Customer check-in | PATCH | `/api/tickets/7/checkin` | customer token | `403` |
| Staff check-in | PATCH | `/api/tickets/7/checkin` | staff token | `200` |

---

## 📋 THỨ TỰ TEST ĐẦY ĐỦ

```
1.  POST /auth/signup                  → tạo customer (204)
2.  DB: UPDATE role='admin'            → set admin trong DB
3.  DB: UPDATE role='staff'            → set staff trong DB
4.  POST /auth/signin (customer)       → lấy customer token
5.  POST /bookings                     → tạo booking → lấy bookingId, ticketId, qrCode, paymentId
6.  GET  /tickets/booking/:bookingId   → xem vé, kiểm tra QR code
7.  POST /auth/signin (admin)          → lấy admin token
8.  GET  /payments/booking/:bookingId  → lấy paymentId (nếu chưa có)
9.  POST /payments/:paymentId/approve  → duyệt payment → booking=paid
10. GET  /bookings/:bookingId          → confirm booking = paid
11. POST /auth/signin (staff)          → lấy staff token
12. GET  /tickets/check/:qrCode        → staff tìm vé theo QR
13. PATCH /tickets/:ticketId/checkin   → staff check-in hành khách → ticket=used
```
POST http://localhost:3000/api/payments/3/pay
Authorization: Bearer <token>

{
  "paymentMethod": "momo"
}
