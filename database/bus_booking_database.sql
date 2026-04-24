-- =====================================================
-- Bus Booking System - Database Schema
-- Phiên bản: 2.0
-- Cập nhật: Thêm route_fares, price_rules, driver_name,
--            qr_code vé, trạng thái vé, chuẩn hóa payments
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `price_rules`;
DROP TABLE IF EXISTS `route_fares`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `trip_seats`;
DROP TABLE IF EXISTS `trips`;
DROP TABLE IF EXISTS `buses`;
DROP TABLE IF EXISTS `bus_types`;
DROP TABLE IF EXISTS `routes`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `sessions`;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. QUẢN LÝ NGƯỜI DÙNG
-- =====================================================
CREATE TABLE `users` (
  `id`        int          NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) DEFAULT NULL,
  `email`     varchar(100) DEFAULT NULL,
  `phone`     varchar(20)  DEFAULT NULL,
  `password`  varchar(255) DEFAULT NULL,
  `role`      varchar(20)  NOT NULL DEFAULT 'customer'  COMMENT 'admin | customer',
  `status`    varchar(20)  NOT NULL DEFAULT 'active'    COMMENT 'active | banned',
  `createdAt` timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- Session (Quản lý Refresh Token)
-- =====================================================
CREATE TABLE `sessions` (
  `id`           int          NOT NULL AUTO_INCREMENT,
  `userId`       int          NOT NULL,
  `refreshToken` varchar(255) NOT NULL,
  `expiresAt`    datetime     NOT NULL,
  `createdAt`    timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    timestamp    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refreshToken` (`refreshToken`),
  KEY `idx_session_user` (`userId`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 2. QUẢN LÝ TUYẾN ĐƯỜNG & ĐỘI XE
-- =====================================================
CREATE TABLE `routes` (
  `id`                 int          NOT NULL AUTO_INCREMENT,
  `departure_location` varchar(100) NOT NULL,
  `arrival_location`   varchar(100) NOT NULL,
  `distance_km`        int          DEFAULT NULL,
  `duration_est`       time         DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bus_types` (
  `id`          int         NOT NULL AUTO_INCREMENT,
  `type_name`   varchar(50) NOT NULL COMMENT 'VD: Limousine 9 chỗ, Giường nằm 40 chỗ',
  `total_seats` int         NOT NULL,
  `seat_layout` json        DEFAULT NULL COMMENT 'JSON cấu trúc ghế để Frontend render UI chọn ghế',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `buses` (
  `id`               int          NOT NULL AUTO_INCREMENT,
  `license_plate`    varchar(20)  NOT NULL,
  `bus_type_id`      int          NOT NULL,
  `driver_name`      varchar(100) DEFAULT NULL,
  `status`           enum('active','maintenance') NOT NULL DEFAULT 'active',
  `maintenance_note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `idx_bus_type` (`bus_type_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 3. HỆ THỐNG GIÁ VÉ (Giá gốc + Luật linh hoạt)
-- =====================================================
CREATE TABLE `route_fares` (
  `id`           int            NOT NULL AUTO_INCREMENT,
  `route_id`     int            NOT NULL,
  `bus_type_id`  int            NOT NULL,
  `base_price`   decimal(12,2)  NOT NULL COMMENT 'Giá vé ngày thường. VD: 300000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_route_bustype` (`route_id`, `bus_type_id`) COMMENT 'Mỗi tuyến + loại xe chỉ có 1 giá gốc',
  KEY `idx_fare_route` (`route_id`),
  KEY `idx_fare_bustype` (`bus_type_id`),
  CONSTRAINT `route_fares_ibfk_1` FOREIGN KEY (`route_id`)    REFERENCES `routes`    (`id`),
  CONSTRAINT `route_fares_ibfk_2` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `price_rules` (
  `id`               int           NOT NULL AUTO_INCREMENT,
  `rule_name`        varchar(100)  NOT NULL,
  `route_id`         int           DEFAULT NULL COMMENT 'null = áp dụng tất cả tuyến',
  `bus_type_id`      int           DEFAULT NULL COMMENT 'null = áp dụng tất cả loại xe',
  `price_multiplier` decimal(5,2)  DEFAULT NULL COMMENT '1.2 = tăng 20%',
  `price_delta`      decimal(12,2) DEFAULT NULL COMMENT '+50000 hoặc -20000',
  `start_date`       datetime      NOT NULL,
  `end_date`         datetime      NOT NULL,
  `priority`         int           NOT NULL DEFAULT 1 COMMENT 'Rule ưu tiên cao hơn sẽ được áp dụng',
  `status`           varchar(20)   NOT NULL DEFAULT 'active' COMMENT 'active | inactive',
  PRIMARY KEY (`id`),
  KEY `idx_rule_route`   (`route_id`),
  KEY `idx_rule_bustype` (`bus_type_id`),
  KEY `idx_rule_date`    (`start_date`, `end_date`),
  CONSTRAINT `price_rules_ibfk_1` FOREIGN KEY (`route_id`)    REFERENCES `routes`    (`id`) ON DELETE SET NULL,
  CONSTRAINT `price_rules_ibfk_2` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 4. QUẢN LÝ CHUYẾN XE
-- =====================================================
CREATE TABLE `trips` (
  `id`                   int          NOT NULL AUTO_INCREMENT,
  `route_id`             int          DEFAULT NULL,
  `bus_id`               int          DEFAULT NULL COMMENT 'Biết chính xác xe và tài xế nào chạy chuyến này',
  `departure_time`       datetime     NOT NULL,
  `arrival_time_expected` datetime    DEFAULT NULL,
  `status`               enum('scheduled','departing','completed','cancelled') DEFAULT 'scheduled',
  `cancel_policy`        text         DEFAULT NULL COMMENT 'Chính sách hoàn hủy vé',
  PRIMARY KEY (`id`),
  KEY `idx_trip_route` (`route_id`),
  KEY `idx_trip_bus`   (`bus_id`),
  CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  CONSTRAINT `trips_ibfk_2` FOREIGN KEY (`bus_id`)   REFERENCES `buses`  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 5. QUẢN LÝ GHẾ THEO CHUYẾN (Real-time)
-- =====================================================
CREATE TABLE `trip_seats` (
  `id`           int         NOT NULL AUTO_INCREMENT,
  `trip_id`      int         NOT NULL,
  `seat_number`  varchar(10) NOT NULL COMMENT 'A1, A2, B1...',
  `status`       enum('available','pending','booked') DEFAULT 'available',
  `pending_until` datetime   DEFAULT NULL COMMENT 'Hết hạn giữ chỗ (VD: 10 phút)',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_trip_seat` (`trip_id`, `seat_number`),
  KEY `idx_trip_seat_trip` (`trip_id`),
  CONSTRAINT `trip_seats_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 6. ĐẶT VÉ & THANH TOÁN
-- =====================================================
CREATE TABLE `bookings` (
  `id`           int            NOT NULL AUTO_INCREMENT,
  `user_id`      int            DEFAULT NULL,
  `trip_id`      int            DEFAULT NULL,
  `total_amount` decimal(12,2)  DEFAULT NULL,
  `status`       enum('pending','paid','cancelled') DEFAULT 'pending',
  `booking_time` timestamp      NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_user` (`user_id`),
  KEY `idx_booking_trip` (`trip_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tickets` (
  `id`              int          NOT NULL AUTO_INCREMENT,
  `booking_id`      int          DEFAULT NULL,
  `trip_seat_id`    int          DEFAULT NULL,
  `passenger_name`  varchar(100) DEFAULT NULL COMMENT 'Tên người đi thực tế (có thể đặt hộ)',
  `passenger_phone` varchar(20)  DEFAULT NULL,
  `qr_code`         varchar(255) DEFAULT NULL COMMENT 'Mã vé điện tử E-ticket',
  `status`          enum('unused','used','cancelled') NOT NULL DEFAULT 'unused',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_trip_seat_id` (`trip_seat_id`) COMMENT '1 ghế chỉ map với 1 vé duy nhất',
  UNIQUE KEY `unique_qr_code` (`qr_code`),
  KEY `idx_ticket_booking` (`booking_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`booking_id`)   REFERENCES `bookings`   (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`trip_seat_id`) REFERENCES `trip_seats`  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id`               int           NOT NULL AUTO_INCREMENT,
  `booking_id`       int           NOT NULL,
  `payment_method`   varchar(50)   NOT NULL COMMENT 'momo | zalo_pay | bank_transfer',
  `amount`           decimal(12,2) NOT NULL,
  `status`           enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_time` timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_payment` (`booking_id`) COMMENT '1 booking chỉ có 1 payment',
  KEY `idx_payment_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
