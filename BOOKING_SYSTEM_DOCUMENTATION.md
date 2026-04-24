## 📚 Booking Module - System Documentation

---

## 🎯 Tổng Quan

**Module:** Bookings + Tickets + Payments
**Tác vụ:** Quản lý việc đặt vé, hành khách, thanh toán
**Số files:** 9 files (3 Models + 3 Controllers + 3 Routes + 1 setupAssociations + server.js updated)

---

## 📊 Database Schema

### 1. Booking Table

```
Booking {
  id: INT (PK, auto-increment)
  userId: INT (FK → Users.id, CASCADE)
  tripId: INT (FK → Trips.id, CASCADE) - Chuyến xe được đặt
  totalAmount: DECIMAL(10,2) - Tổng tiền
  status: ENUM('pending', 'paid', 'cancelled') - DEFAULT 'pending'
  bookingTime: DATE - DEFAULT NOW()
  createdAt: DATETIME (auto)
  updatedAt: DATETIME (auto)
}
```

**Tài liệu:** Mỗi Booking là 1 lần đặt vé từ user cho 1 chuyến xe
**Luồng:** pending (chờ thanh toán) → paid (đã thanh toán) → cancelled (hủy)

---

### 2. Ticket Table

```
Ticket {
  id: INT (PK, auto-increment)
  bookingId: INT (FK → Bookings.id, CASCADE)
  tripSeatId: INT (FK → TripSeats.id, CASCADE) - Ghế cụ thể
  passengerName: VARCHAR(100) - Tên hành khách
  passengerPhone: VARCHAR(20) - SĐT hành khách
  createdAt: DATETIME (auto)
  updatedAt: DATETIME (auto)
}
```

**Tài liệu:** Mỗi Ticket là 1 vé cho 1 hành khách trên 1 ghế
**Mối quan hệ:** 1 Booking có N Tickets (N = số ghế đặt)
**Ví dụ:** Booking 3 ghế → tạo 3 Tickets (mỗi ticket là 1 hành khách)

---

### 3. Payment Table

```
Payment {
  id: INT (PK, auto-increment)
  bookingId: INT (FK → Bookings.id, UNIQUE, CASCADE) - 1 booking = 1 payment
  amount: DECIMAL(10,2) - Số tiền thanh toán
  method: ENUM('momo', 'vnpay', 'card', 'cash') - Phương thức
  status: ENUM('pending', 'success', 'failed', 'refunded') - DEFAULT 'pending'
  providerTransactionId: VARCHAR(255) - ID từ payment provider
  paidAt: DATE - Thời gian thanh toán thành công
  createdAt: DATETIME (auto)
  updatedAt: DATETIME (auto)
}
```

**Tài liệu:** Mỗi Payment là 1 lần thanh toán cho 1 Booking
**Luồng:** pending (chờ) → success (thành công) / failed (thất bại) / refunded (hoàn tiền)

---

## 🔗 Model Relationships (Associations)

```
User (1)
  ├─ hasMany → Booking (N)
  │            ├─ hasMany → Ticket (N: 1 booking = N tickets)
  │            └─ hasOne → Payment (1: 1 booking = 1 payment)
  └─ hasMany → Session (N)
```

**Setup Associations:** File `backend/src/libs/setupAssociations.js`

---

## 📡 API Endpoints

### Booking Endpoints

```
GET /api/bookings
  Query: ?user_id=1&status=paid&trip_id=1
  Response: [{ id, userId, tripId, status, totalAmount, ... }, ...]

POST /api/bookings
  Body: { user_id, trip_id, total_amount, tickets: [{trip_seat_id, passenger_name, passenger_phone}, ...] }
  Response: { booking, tickets, payment }
  Status: 201

GET /api/bookings/:id
  Response: { booking + tickets + payment }
  Status: 200

PUT /api/bookings/:id
  Body: { status, total_amount }
  Response: updated booking
  Status: 200

DELETE /api/bookings/:id
  Status: 204

GET /api/bookings/user/:userId
  Response: [{ booking1 }, { booking2 }, ...]
  Status: 200

POST /api/bookings/:id/cancel
  Response: cancelled booking
  Status: 200
```

### Ticket Endpoints

```
GET /api/tickets
  Query: ?booking_id=1&trip_seat_id=5
  Response: [{ id, bookingId, tripSeatId, passengerName, passengerPhone }, ...]

POST /api/tickets
  Body: { booking_id, trip_seat_id, passenger_name, passenger_phone }
  Response: { ticket }
  Status: 201

GET /api/tickets/:id
  Response: { ticket }

PUT /api/tickets/:id
  Body: { passenger_name, passenger_phone }
  Response: updated ticket
  Status: 200

DELETE /api/tickets/:id
  Status: 204

GET /api/bookings/:bookingId/tickets
  Response: { booking: {...}, tickets: [...], ticketCount: N }
  Status: 200
```

### Payment Endpoints

```
GET /api/payments
  Query: ?status=success&method=momo&booking_id=1
  Response: [{ id, bookingId, amount, method, status, paidAt, ... }, ...]

POST /api/payments
  Body: { booking_id, amount, method }
  Response: { payment }
  Status: 201

GET /api/payments/:id
  Response: { payment }

PUT /api/payments/:id
  Body: { status, provider_transaction_id, paid_at }
  Response: updated payment + auto update booking status
  Status: 200

GET /api/bookings/:bookingId/payment
  Response: { payment }

POST /api/payments/:id/approve [ADMIN]
  Body: { provider_transaction_id }
  Response: { payment with status="success", payment.paidAt=NOW() }
  Status: 200

POST /api/payments/:id/reject [ADMIN]
  Response: { payment with status="failed" }
  Status: 200

POST /api/payments/:id/refund [ADMIN]
  Response: { payment with status="refunded", booking status="cancelled" }
  Status: 200
```

---

## 🔄 Workflow & Luồng Hoạt Động

### Luồng Đặt Vé (Booking Flow)

```
1. User chọn chuyến xe (tripId) + số ghế + hành khách
   ↓
2. Client gọi POST /api/bookings
   {
     "userId": 1,
     "tripId": 1,
     "totalAmount": 500000,
     "tickets": [
       { "tripSeatId": 1, "passengerName": "Nguyễn A", "passengerPhone": "0123" },
       { "tripSeatId": 2, "passengerName": "Nguyễn B", "passengerPhone": "0456" }
     ]
   }
   ↓
3. Server tạo:
   - 1 Booking record (status="pending")
   - N Ticket records (mỗi ticket cho 1 ghế)
   - 1 Payment record (status="pending")
   ↓
4. Client nhận Booking ID + thông tin vé
   ↓
5. User chọn phương thức thanh toán
   ↓
6. Client gọi PUT /api/payments/{paymentId}
   {
     "status": "pending",
     "method": "momo",
     "providerTransactionId": "MOMO_TXN_123456"
   }
   ↓
7. Server approve: POST /api/payments/{paymentId}/approve
   - Payment.status = "success"
   - Payment.paidAt = NOW()
   - Booking.status = "paid" (auto update)
   ↓
8. Luồng hoàn thành ✅
```

### Status Transition Rules

**Booking Status Flow:**

```
pending ──→ paid
  ├──→ cancelled (user hủy trước thanh toán)

paid ──→ cancelled (user hủy sau thanh toán → refund)
```

**Payment Status Flow:**

```
pending ──→ success (thanh toán thành công)
pending ──→ failed (thanh toán thất bại)
success ──→ refunded (admin hoàn tiền)
```

---

## 💻 Code Structure

### Model Pattern (Booking.js example)

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../libs/db.js';

const Booking = sequelize.define(
  'Booking',
  {
    // Fields định nghĩa
    field_name: {
      type: DataTypes.TYPE,
      allowNull: false,
      references: { model: 'ParentTable', key: 'id' }, // FK
      onDelete: 'CASCADE',
    },
  },
  {
    timestamps: true, // Tự động createdAt, updatedAt
  }
);

export default Booking;
```

### Controller Pattern (bookingController.js example)

```javascript
export const functionName = async (req, res) => {
  try {
    // 1. Lấy data từ request
    const { field1, field2 } = req.body;

    // 2. Validate
    if (!field1) return res.status(400).json({ message: '...' });

    // 3. Check existence
    const model = await Model.findByPk(id);
    if (!model) return res.status(404).json({ message: '...' });

    // 4. Process (create/update/delete/...)
    await model.save();

    // 5. Response
    return res.status(200).json(model);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

### Route Pattern (bookingRoute.js example)

```javascript
import express from 'express';
import { functionName } from '../controllers/modelController.js';

const router = express.Router();

router.get('/', functionName); // GET /api/bookings/
router.post('/', functionName); // POST /api/bookings/

export default router;
```

---

## 🧪 Testing với Postman

### Test 1: Create Booking

```
POST http://localhost:3000/api/bookings
Content-Type: application/json

{
  "userId": 1,
  "tripId": 1,
  "totalAmount": 500000,
  "tickets": [
    {
      "tripSeatId": 1,
      "passengerName": "Nguyễn Văn A",
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

### Test 2: Get Booking

```
GET http://localhost:3000/api/bookings/1
```

### Test 3: Create Payment

```
POST http://localhost:3000/api/payments
Content-Type: application/json

{
  "bookingId": 1,
  "amount": 500000,
  "method": "momo"
}
```

### Test 4: Approve Payment

```
POST http://localhost:3000/api/payments/1/approve
Content-Type: application/json

{
  "providerTransactionId": "MOMO_TXN_2024_001"
}
```

### Test 5: Get Booking Tickets

```
GET http://localhost:3000/api/bookings/1/tickets
```

---

## 📝 Notes & Important Info

### ⚠️ Phụ thuộc (Dependencies)

**Chưa hoàn thành hiện tại:**

- `Trip` model (Người 2 sẽ làm)
- `TripSeat` model (Người 2 sẽ làm)
- `Route` model (Người 2 sẽ làm)
- `BusType` model (Người 2 sẽ làm)
- `Bus` model (Người 2 sẽ làm)

**Cách xử lý:**

- Booking & Ticket có FK references đến Trips & TripSeats nhưng không validate khi create
- Khi Người 2 hoàn thành các model đó, tự động FK constraint sẽ hoạt động
- Có thể update setupAssociations.js để add associations khi Trip + TripSeat ready

### ✅ Đã Hoàn Thành

1. ✅ Booking Model - định nghĩa cấu trúc
2. ✅ Ticket Model - định nghĩa cấu trúc
3. ✅ Payment Model - định nghĩa cấu trúc
4. ✅ BookingController - 7 functions
5. ✅ TicketController - 6 functions
6. ✅ PaymentController - 8 functions
7. ✅ bookingRoute - định nghĩa routes
8. ✅ ticketRoute - định nghĩa routes
9. ✅ paymentRoute - định nghĩa routes
10. ✅ setupAssociations.js - define relationships
11. ✅ server.js updated - import routes + setupAssociations

### 🔍 Error Handling

**Common Errors:**

- 400 Bad Request: Missing required fields
- 404 Not Found: Resource not found (user, booking, payment, ...)
- 409 Conflict: Unique constraint violation (VD: 1 booking có 2 payments)
- 500 Server Error: Unexpected error

**Validation:**

- Trim() tất cả string inputs
- Check FK existence trước create
- Check status transition validity
- Amount phải > 0
- Method phải là ENUM hợp lệ

---

## 🚀 Next Steps (Khi Người 2 Hoàn Thành)

1. Thêm Trip + TripSeat + Route + BusType + Bus models
2. Update setupAssociations.js với new associations
3. Test integration toàn bộ flow booking
4. Add protection middleware (protectedRoute) nếu cần
5. Add admin middleware cho certifications endpoints (approve, reject, refund)

---

## 📞 Support

**Issues?**

- Check controller error messages
- Verify FK relationships setup
- Test với Postman query các endpoints một cách tuần tự
- Check server.js có import tất cả routes không
