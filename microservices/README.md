# 🚌 Bus Booking – Microservices Architecture

Hệ thống đặt vé xe khách theo kiến trúc microservices gồm **6 services độc lập**, giao tiếp qua HTTP REST thông qua API Gateway.

---

## 📐 Kiến trúc tổng quan

```
Client (Frontend)
      │
      ▼
┌─────────────────────┐
│    API Gateway       │  :5000  — Xác thực JWT, proxy routing
└─────────┬───────────┘
          │ (HTTP nội bộ)
    ┌─────┼──────────────────────────────────┐
    ▼     ▼         ▼          ▼             ▼
User   Catalog    Trip       Order      Notification
:5001   :5002     :5003      :5004         :5005
  │       │         │          │              │
 DB      DB        DB         DB           SMTP
(users)(catalog)(trips)    (orders)      (Gmail)
```

---

## 📦 Danh sách Services

| Service              | Port | Database             | Chức năng |
|----------------------|------|----------------------|-----------|
| **API Gateway**      | 5000 | —                    | Reverse proxy, xác thực JWT |
| **User Service**     | 5001 | `bus_booking_users`  | Đăng ký, đăng nhập, quản lý tài khoản |
| **Catalog Service**  | 5002 | `bus_booking_catalog`| Xe, loại xe, tuyến đường, giá vé |
| **Trip Service**     | 5003 | `bus_booking_trips`  | Chuyến xe, trạng thái ghế |
| **Order Service**    | 5004 | `bus_booking_orders` | Đặt vé, thanh toán, vé điện tử |
| **Notification Service** | 5005 | —               | Gửi email xác nhận / huỷ vé |

---

## 🚀 Cách chạy

### Phương án 1: Chạy thủ công từng service

#### 1. Cài đặt dependencies
```bash
# Chạy trong thư mục mỗi service
cd api-gateway && npm install
cd ../user-service && npm install
cd ../catalog-service && npm install
cd ../trip-service && npm install
cd ../order-service && npm install
cd ../notification-service && npm install
```

#### 2. Tạo databases trong MySQL
```sql
CREATE DATABASE bus_booking_users    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE bus_booking_catalog  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE bus_booking_trips    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE bus_booking_orders   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
> **Lưu ý:** Sequelize sẽ tự động `sync()` tạo bảng khi service khởi động.

#### 3. Cấu hình .env
Mỗi service có file `.env` riêng. Chỉnh sửa `DB_PASSWORD` và thông tin SMTP phù hợp.

#### 4. Khởi động services

**Windows (PowerShell):**
```powershell
cd microservices
.\start-all.ps1
```

**Hoặc chạy từng service:**
```bash
cd trip-service && npm run dev
cd order-service && npm run dev
cd notification-service && npm run dev
```

---

### Phương án 2: Docker Compose

```bash
cd microservices
docker-compose up -d --build
```

Dừng tất cả:
```bash
docker-compose down
```

---

## 🔌 API Endpoints (qua API Gateway :5000)

### Auth (User Service)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |

### Catalog
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/buses` | Danh sách xe |
| GET | `/api/routes` | Danh sách tuyến |
| GET | `/api/route-fares` | Bảng giá theo tuyến & loại xe |

### Trip
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/trips?routeId=&date=` | Tìm chuyến theo tuyến + ngày |
| GET | `/api/trips/:id` | Chi tiết chuyến + danh sách ghế |
| POST | `/api/trips` | Tạo chuyến mới (Admin) |
| GET | `/api/trip-seats?tripId=` | Danh sách ghế một chuyến |

### Order
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/bookings` | **Đặt vé** (lock ghế + tạo vé) |
| GET | `/api/bookings?userId=` | Lịch sử đặt vé |
| PUT | `/api/bookings/:id/confirm` | Xác nhận thanh toán |
| PUT | `/api/bookings/:id/cancel` | Huỷ đặt vé |
| GET | `/api/tickets/code/:code` | Tra cứu vé bằng mã |

---

## 🔄 Luồng đặt vé

```
1. User chọn chuyến → GET /api/trips/:id  (xem ghế trống)
2. User chọn ghế    → POST /api/bookings  
   └─ Order Service → Trip Service: lock ghế (pessimistic lock)
   └─ Tạo Booking (pending) + Payment (pending) + Ticket(s)
3. User thanh toán  → PUT /api/bookings/:id/confirm
   └─ Payment → paid, Booking → confirmed
   └─ Trip Service: ghế → booked
   └─ Notification Service: gửi email xác nhận
4. Huỷ vé           → PUT /api/bookings/:id/cancel
   └─ Trip Service: ghế → available
   └─ Notification Service: gửi email huỷ vé
```

---

## ⚙️ Cấu hình Notification Service (Gmail)

1. Vào Google Account → Security → **App Passwords**
2. Tạo App Password cho "Mail"
3. Điền vào `notification-service/.env`:
```env
MAIL_USER=your_email@gmail.com
MAIL_PASS=xxxx xxxx xxxx xxxx   # App Password (16 ký tự)
```

---

## 🗃️ Database Schema

| Service | Database | Tables |
|---------|----------|--------|
| User | `bus_booking_users` | Users, Sessions |
| Catalog | `bus_booking_catalog` | BusTypes, Buses, Routes, RouteStops, RouteFares, PriceRules |
| Trip | `bus_booking_trips` | Trips, TripSeats |
| Order | `bus_booking_orders` | Bookings, Payments, Tickets |
