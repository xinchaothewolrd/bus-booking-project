-- ============================================================
-- BUS BOOKING - TRIP SERVICE DATABASE
-- Database: bus_booking_trips
-- Port 5003
-- ============================================================

CREATE DATABASE IF NOT EXISTS bus_booking_trips CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bus_booking_trips;

-- ─── Trips ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS Trips (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  routeId         INT NOT NULL          COMMENT 'Tham chiếu Route trong Catalog Service',
  busId           INT NOT NULL          COMMENT 'Tham chiếu Bus trong Catalog Service',
  departureTime   DATETIME NOT NULL,
  arrivalTime     DATETIME NOT NULL,
  basePrice       DECIMAL(12,2) NOT NULL DEFAULT 0,
  availableSeats  INT NOT NULL DEFAULT 0,
  status          ENUM('scheduled','ongoing','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  note            VARCHAR(255) DEFAULT NULL,
  createdAt       DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_routeId (routeId),
  INDEX idx_busId (busId),
  INDEX idx_departureTime (departureTime),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ─── TripSeats ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS TripSeats (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  tripId      INT NOT NULL,
  seatNumber  VARCHAR(10) NOT NULL COMMENT 'VD: A1, B2, 01, 25',
  status      ENUM('available','locked','booked') NOT NULL DEFAULT 'available',
  bookingId   INT DEFAULT NULL   COMMENT 'Tham chiếu Booking trong Order Service',
  lockedAt    DATETIME DEFAULT NULL,
  UNIQUE KEY uq_trip_seat (tripId, seatNumber),
  FOREIGN KEY (tripId) REFERENCES Trips(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_bookingId (bookingId)
) ENGINE=InnoDB;
