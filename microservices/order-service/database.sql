-- ============================================================
-- BUS BOOKING - ORDER SERVICE DATABASE
-- Database: bus_booking_orders
-- Port 5004
-- ============================================================

CREATE DATABASE IF NOT EXISTS bus_booking_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_booking_orders;

-- ─── Bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL          COMMENT 'Tham chiếu User trong User Service',
  tripId        INT NOT NULL          COMMENT 'Tham chiếu Trip trong Trip Service',
  tripSnapshot  JSON DEFAULT NULL     COMMENT 'Snapshot thông tin chuyến tại lúc đặt',
  seatNumbers   JSON NOT NULL         COMMENT 'Danh sách ghế đặt, VD: ["A1","A2"]',
  totalAmount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        ENUM('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
  cancelReason  VARCHAR(255) DEFAULT NULL,
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_tripId (tripId),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ─── Payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Payments (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  bookingId      INT NOT NULL,
  amount         DECIMAL(12,2) NOT NULL,
  method         ENUM('cash','card','bank_transfer','momo','vnpay') NOT NULL DEFAULT 'cash',
  status         ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  transactionId  VARCHAR(100) DEFAULT NULL,
  paidAt         DATETIME DEFAULT NULL,
  note           VARCHAR(255) DEFAULT NULL,
  createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE CASCADE,
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ─── Tickets ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Tickets (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  bookingId       INT NOT NULL,
  ticketCode      VARCHAR(50) NOT NULL UNIQUE COMMENT 'UUID mã vé điện tử',
  seatNumber      VARCHAR(10) NOT NULL,
  passengerName   VARCHAR(100) NOT NULL,
  passengerPhone  VARCHAR(20) DEFAULT NULL,
  passengerEmail  VARCHAR(100) DEFAULT NULL,
  status          ENUM('active','used','cancelled') NOT NULL DEFAULT 'active',
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE CASCADE,
  INDEX idx_ticketCode (ticketCode),
  INDEX idx_status (status)
) ENGINE=InnoDB;
