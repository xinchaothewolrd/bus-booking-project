# 📋 BÁNH CÁO KIỂM TRA MIGRATION: MONOLITH → MICROSERVICES

**Ngày kiểm tra:** 2025-06-23  
**Kết luận:** ❌ **CHƯA HOÀN CHỈNH** - Còn nhiều hàm và tệp cần được chuyển

---

## 📊 TÓM TẮT HIỆN TRẠNG

| Service | Status | Chi tiết |
|---------|--------|---------|
| **api-gateway** | ✅ Hoàn thiện | Có routes, middlewares, server.js |
| **user-service** | ⚠️ Bộ phận | Chỉ có 2 controllers (auth, user), còn thiếu |
| **catalog-service** | ❌ Trống | Controllers folder TRỐNG - logic chưa được chuyển |
| **order-service** | ❌ Trống | Controllers folder TRỐNG - logic chưa được chuyển |
| **trip-service** | ❌ Trống | Controllers folder TRỐNG - logic chưa được chuyển |
| **notification-service** | ⚠️ Cơ bản | Chỉ có server.js, chưa có logic |

---

## ❌ VẤN ĐỀ CHÍNH

### 🔴 VẤN ĐỀ 1: Controllers Bị Thiếu Hoàn Toàn

#### **CATALOG-SERVICE** (Quản lý danh mục)
**Trạng thái:** Controllers folder TRỐNG  
**Hàm cần chuyển từ backend:**

```javascript
// busController.js
- getAllBuses()          // GET /api/buses
- getBusById()           // GET /api/buses/:id
- createBus()            // POST /api/buses
- updateBus()            // PUT /api/buses/:id
- deleteBus()            // DELETE /api/buses/:id

// busTypeController.js
- getAllBusTypes()       // GET /api/bus-types
- getBusTypeById()       // GET /api/bus-types/:id
- createBusType()        // POST /api/bus-types
- updateBusType()        // PUT /api/bus-types/:id
- deleteBusType()        // DELETE /api/bus-types/:id

// routeController.js
- getAllRoutes()         // GET /api/routes
- getRouteById()         // GET /api/routes/:id
- createRoute()          // POST /api/routes
- updateRoute()          // PUT /api/routes/:id
- deleteRoute()          // DELETE /api/routes/:id

// routeFareController.js
- getAllRouteFares()     // GET /api/route-fares
- getRouteFareById()     // GET /api/route-fares/:id
- createRouteFare()      // POST /api/route-fares
- updateRouteFare()      // PUT /api/route-fares/:id
- deleteRouteFare()      // DELETE /api/route-fares/:id

// routeStopController.js
- getRouteStops()        // GET /api/route-stops
- getRouteStopById()     // GET /api/route-stops/:id
- createRouteStop()      // POST /api/route-stops
- updateRouteStop()      // PUT /api/route-stops/:id
- deleteRouteStop()      // DELETE /api/route-stops/:id

// priceRuleController.js
- getAllPriceRules()     // GET /api/price-rules
- getActivePriceRules()  // GET /api/price-rules/active
- getPriceRuleById()     // GET /api/price-rules/:id
- createPriceRule()      // POST /api/price-rules
- updatePriceRule()      // PUT /api/price-rules/:id
- deletePriceRule()      // DELETE /api/price-rules/:id
```

**Hiện tại:** Logic được viết TRỰC TIẾP TRONG ROUTES (không tuân theo cấu trúc MVC)  
**Vị trí:** `microservices/catalog-service/src/routes/busRoute.js` (thay vì controllers)

---

#### **ORDER-SERVICE** (Quản lý đặt vé & thanh toán)
**Trạng thái:** Controllers folder TRỐNG  
**Hàm cần chuyển từ backend:**

```javascript
// bookingController.js
- getAllBookings()       // GET /api/bookings (Admin)
- createBooking()        // POST /api/bookings
- getBookingById()       // GET /api/bookings/:id
- updateBooking()        // PUT /api/bookings/:id (Admin)
- deleteBooking()        // DELETE /api/bookings/:id (Admin)
- cancelBooking()        // Custom: Hủy booking

// paymentController.js
- getAllPayments()       // GET /api/payments (Admin)
- createPayment()        // POST /api/payments
- getPaymentById()       // GET /api/payments/:id
- updatePayment()        // PUT /api/payments/:id
- approvePayment()       // POST /api/payments/:id/approve
- rejectPayment()        // POST /api/payments/:id/reject
- [Internal] _confirmBookingAndSeats()  // Helper

// ticketController.js
- getAllTickets()        // GET /api/tickets (Admin)
- createTicket()         // POST /api/tickets
- getTicketById()        // GET /api/tickets/:id
- updateTicket()         // PUT /api/tickets/:id
- deleteTicket()         // DELETE /api/tickets/:id
- getTicketsByBooking()  // GET /api/tickets/booking/:bookingId
- getTicketByQrCode()    // GET /api/tickets/qr/:qrCode
- checkInTicket()        // POST /api/tickets/:id/check-in
```

**Hiện tại:** Logic được viết TRỰC TIẾP TRONG ROUTES (không tuân theo cấu trúc MVC)  
**Vị trí:** `microservices/order-service/src/routes/bookingRoute.js`

---

#### **TRIP-SERVICE** (Quản lý chuyến xe)
**Trạng thái:** Controllers folder TRỐNG  
**Hàm cần chuyển từ backend:**

```javascript
// tripController.js
- getAllTrips()          // GET /api/trips
- getTripById()          // GET /api/trips/:id
- createTrip()           // POST /api/trips
- updateTrip()           // PUT /api/trips/:id
- deleteTrip()           // DELETE /api/trips/:id

// tripSeatController.js
- getAllTripSeats()      // GET /api/trip-seats
- getTripSeatById()      // GET /api/trip-seats/:id
- getSeatsByTripId()     // GET /api/trips/:tripId/seats (Quan trọng!)
- createTripSeat()       // POST /api/trip-seats
- updateTripSeat()       // PUT /api/trip-seats/:id
- deleteTripSeat()       // DELETE /api/trip-seats/:id
```

**Hiện tại:** Không rõ trạng thái (có thể chưa được tạo)

---

### 🔴 VẤN ĐỀ 2: USER-SERVICE Chưa Hoàn Chỉnh

**Trạng thái:** Có authController.js, nhưng thiếu userController.js

**Hàm cần chuyển thêm từ backend (userController.js):**

```javascript
// userController.js
- getAllUsers()          // GET /api/users (Admin)
- getUserById()          // GET /api/users/:id
- updateUser()           // PUT /api/users/:id
- deleteUser()           // DELETE /api/users/:id
- blockUser()            // POST /api/users/:id/block (Admin)
- unblockUser()          // POST /api/users/:id/unblock (Admin)
- authMe()               // GET /api/users/me (Lấy thông tin user hiện tại)
```

**Hiện tại:** Chỉ có authController.js với signUp, signIn, refreshToken  
**Thiếu:** userController.js hoàn chỉnh (CRUD users + management)

---

### 🟡 VẤN ĐỀ 3: Cấu Trúc Thư Mục Không Tuân Theo MVC

**Vấn đề:** Logic ứng dụng được viết TRỰC TIẾP TRONG ROUTES thay vì CONTROLLERS

**Ví dụ - SẼ:**
```
catalog-service/src/
├── controllers/         ← TRỐNG (logic chưa được tách ra)
│   ├── busController.js     (chưa có)
│   ├── routeController.js   (chưa có)
│   └── ...
├── routes/
│   ├── busRoute.js      ← Logic nằm ở đây (SAI)
│   └── ...
├── models/
└── ...
```

**NÊN LÀ:**
```
catalog-service/src/
├── controllers/         ← PHẢI CÓ
│   ├── busController.js     ✅ Logic ở đây
│   ├── routeController.js   ✅ Logic ở đây
│   └── ...
├── routes/
│   ├── busRoute.js      ← CHỈ CÓ: route definitions (import từ controllers)
│   └── ...
├── models/
└── ...
```

---

## 📋 DANH SÁCH CÁC HÀNG CẦN ĐƯỢC CHUYỂN

### Backend Cũ Có 13 Controllers:

1. ✅ **authController.js** (user-service) - Hầu hết đã chuyển
2. ⚠️ **userController.js** - CHƯA CHUYỂN (order-service)
3. ❌ **busController.js** - CHƯA CHUYỂN (catalog-service)
4. ❌ **busTypeController.js** - CHƯA CHUYỂN (catalog-service)
5. ❌ **routeController.js** - CHƯA CHUYỂN (catalog-service)
6. ❌ **routeFareController.js** - CHƯA CHUYỂN (catalog-service)
7. ❌ **routeStopController.js** - CHƯA CHUYỂN (catalog-service)
8. ❌ **priceRuleController.js** - CHƯA CHUYỂN (catalog-service)
9. ❌ **bookingController.js** - CHƯA CHUYỂN (order-service)
10. ❌ **paymentController.js** - CHƯA CHUYỂN (order-service)
11. ❌ **ticketController.js** - CHƯA CHUYỂN (order-service)
12. ❌ **tripController.js** - CHƯA CHUYỂN (trip-service)
13. ❌ **tripSeatController.js** - CHƯA CHUYỂN (trip-service)

---

## 🔧 CÁC ACTION CẦN THỰC HIỆN

### Ưu tiên 1: TẠO CONTROLLERS (Ngay lập tức)

- [ ] **catalog-service:** Tạo 6 controllers (bus, busType, route, routeFare, routeStop, priceRule)
- [ ] **order-service:** Tạo 3 controllers (booking, payment, ticket)
- [ ] **trip-service:** Tạo 2 controllers (trip, tripSeat)
- [ ] **user-service:** Tạo userController (từ backend)

### Ưu tiên 2: REFACTOR ROUTES

- [ ] **catalog-service:** Chuyển logic từ busRoute.js → busController.js
- [ ] **order-service:** Chuyển logic từ bookingRoute.js → bookingController.js (+ payment, ticket routes)
- [ ] **trip-service:** Chuyển logic từ routes → controllers

### Ưu tiên 3: HOÀN THIỆN MODELS

- [ ] Kiểm tra tất cả models đã được chuyển đầy đủ chưa
- [ ] Kiểm tra relationships giữa các models

### Ưu tiên 4: KIỂM ĐỊNH

- [ ] Unit tests cho mỗi service
- [ ] Integration tests giữa các services
- [ ] End-to-end tests từ Frontend → API Gateway → Services

---

## 📝 GHI CHÚ THEO YÊU CẦU THIẾT KẾ (Từ File Word)

Theo đồ án, hệ thống nên có:

```
1. API Gateway (✅ Đã có)
   - Routing ✅
   - Authentication ⚠️ (Cần kiểm tra lại)
   - Database: Không có ✅

2. User Service (⚠️ Bộ phận)
   - Users, Sessions tables ✅
   - Controllers: authController ✅, userController ❌

3. Catalog Service (❌ Chưa có)
   - Quản lý: Bus, BusType, Route, RouteFare, RouteStop, PriceRule
   - Controllers: Tất cả ❌ CHƯA CÓ

4. Order Service (❌ Chưa có)
   - Quản lý: Booking, Payment, Ticket
   - Controllers: Tất cả ❌ CHƯA CÓ

5. Trip Service (❌ Chưa có)
   - Quản lý: Trip, TripSeat
   - Controllers: Tất cả ❌ CHƯA CÓ

6. Notification Service (⚠️ Cơ bản)
   - Email/SMS: Cần hoàn thiện
```

---

## ✅ KẾT LUẬN

**Tình trạng hiện tại:**
- **Công việc hoàn thành:** ~20%
- **Còn lại:** ~80% (phần lớn controllers, refactoring routes, testing)

**Lỗi lớn nhất:**
1. ❌ Controllers chưa được tách riêng (logic nằm trong routes)
2. ❌ Thiếu 11 controllers cần thiết
3. ❌ userController chưa được chuyển

**Đề nghị:**
Bạn cần hoàn thành toàn bộ quá trình migration trước khi test hệ thống.
