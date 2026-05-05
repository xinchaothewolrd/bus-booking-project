# Kế hoạch Xây dựng CRUD cho An (Phần Quản lý Chuyến xe)

Mục tiêu của kế hoạch này là thiết kế và xây dựng chức năng Thêm/Sửa/Xóa/Đọc (CRUD) cơ bản cho 5 bảng dữ liệu được phân công cho An trong hệ thống Bus Booking. Nội dung dưới đây đã được **cập nhật chính xác 100% theo file SQL `bus_booking_database.sql`**.

## Cấu trúc bảng do An phụ trách

### 1. Bảng `bus_types` (Loại Xe)
- `id`: Tự động tăng
- `type_name`: String (Tên loại xe, Varchar 50)
- `total_seats`: Integer (Số lượng chỗ)
- `seat_layout`: JSON (Lưu cấu trúc sơ đồ ghế ngồi)

### 2. Bảng `buses` (Xe khách)
- `id`: Tự động tăng
- `license_plate`: String (Biển số xe cực kỳ duy nhất)
- `bus_type_id`: Khóa ngoại -> Bảng `bus_types`
- `status`: ['active', 'maintenance', 'retired']
- `maintenance_note`: String (Mô tả bảo trì)

### 3. Bảng `routes` (Tuyến Đường)
- `id`: Tự động tăng
- `departure_location`: String (Điểm xuất phát)
- `arrival_location`: String (Điểm đến)
- `distance_km`: Integer (Độ dài đường đi)
- `duration_est`: Time (Thời gian chạy dự kiến)

### 4. Bảng `trips` (Chuyến Đi)
- `id`: Tự động tăng
- `route_id`: Khóa ngoại -> Bảng `routes`
- `bus_type_id`: Khóa ngoại -> Bảng `bus_types`
- `bus_id`: Khóa ngoại -> Bảng `buses`
- `departure_time`: Date (Giờ khởi hành)
- `arrival_time_expected`: Date (Giờ đến nơi)
- `price`: Decimal (Giá vé)
- `status`: ['scheduled', 'departing', 'completed', 'cancelled']

### 5. Bảng `trip_seats` (Ghế Của 1 Chuyến)
- `id`: Tự động tăng
- `trip_id`: Khóa ngoại -> Bảng `trips`
- `seat_number`: String (Mã ghế)
- `status`: ['available', 'pending', 'booked']
- `pending_until`: Date

---

## Danh sách Tính năng tôi sẽ Cài đặt cho bạn (CRUD)
Tôi sẽ tải toàn bộ code thông qua Controller và Router để được các API sau cho **mỗi Models** ở trên:

1. `POST /api/[tên-bang]` : Thêm dữ liệu mới
2. `GET /api/[tên-bang]` : Lấy toàn bộ danh sách 
3. `GET /api/[tên-bang]/:id` : Xem chi tiết 1 bản ghi
4. `PUT /api/[tên-bang]/:id` : Cập nhật thay đổi 1 bản ghi
5. `DELETE /api/[tên-bang]/:id` : Xóa 1 bản ghi


An xem có cần thêm bớt cột nào không? Nếu ổn thì duyệt để tôi cắm mặt vào code cho bạn ngay nhé!
