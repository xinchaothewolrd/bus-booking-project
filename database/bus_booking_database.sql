-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: bus_booking_system
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `trip_id` int DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','paid','cancelled') DEFAULT 'pending',
  `booking_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_booking_status` (`status`),
  KEY `idx_booking_user` (`user_id`),
  KEY `idx_booking_trip` (`trip_id`),
  KEY `idx_booking_userid_status` (`user_id`,`status`),
  CONSTRAINT `bookings_fk_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`),
  CONSTRAINT `bookings_fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (14,1,1,500000.00,'pending','2026-04-09 10:06:52','2026-04-09 10:06:52','2026-04-09 10:06:52'),(15,2,1,250000.00,'cancelled','2026-04-09 12:53:34','2026-04-09 12:53:34','2026-04-09 13:04:00'),(16,2,1,250000.00,'cancelled','2026-04-09 13:00:14','2026-04-09 13:00:14','2026-04-09 13:11:00'),(17,2,1,250000.00,'pending','2026-04-09 13:11:59','2026-04-09 13:11:59','2026-04-09 13:11:59'),(18,2,1,330000.00,'paid','2026-04-09 13:44:40','2026-04-09 13:44:40','2026-04-09 13:46:04'),(19,2,1,330000.00,'cancelled','2026-04-09 14:12:26','2026-04-09 14:12:26','2026-04-09 14:21:29'),(20,2,1,330000.00,'paid','2026-04-09 14:50:54','2026-04-09 14:50:54','2026-04-09 14:53:46'),(21,2,1,330000.00,'pending','2026-04-17 08:38:17','2026-04-17 08:38:17','2026-04-17 08:38:17'),(22,14,1,330000.00,'pending','2026-04-19 08:17:11','2026-04-19 08:17:11','2026-04-19 08:17:11');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bus_types`
--

DROP TABLE IF EXISTS `bus_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bus_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  `total_seats` int NOT NULL,
  `seat_layout` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bus_types`
--

LOCK TABLES `bus_types` WRITE;
/*!40000 ALTER TABLE `bus_types` DISABLE KEYS */;
INSERT INTO `bus_types` VALUES (1,'Giường nằm 40 chỗ',40,NULL);
/*!40000 ALTER TABLE `bus_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `license_plate` varchar(20) NOT NULL,
  `bus_type_id` int NOT NULL,
  `driver_name` varchar(255) DEFAULT NULL,
  `status` enum('active','maintenance') DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  KEY `idx_bus_type` (`bus_type_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('momo','zalo_pay','bank_transfer','cash','card') NOT NULL,
  `status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_time` timestamp NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_booking` (`booking_id`),
  KEY `idx_payment_status` (`status`),
  KEY `idx_payment_booking` (`booking_id`),
  CONSTRAINT `fk_payments_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,14,500000.00,'cash','pending',NULL,'2026-04-09 10:06:52','2026-04-09 10:06:52'),(2,15,250000.00,'cash','pending',NULL,'2026-04-09 12:53:34','2026-04-09 12:53:34'),(3,16,250000.00,'cash','success','2026-04-09 13:00:00','2026-04-09 13:00:14','2026-04-09 13:20:44'),(4,17,250000.00,'cash','pending',NULL,'2026-04-09 13:11:59','2026-04-09 13:11:59'),(5,18,330000.00,'cash','success','2026-04-09 13:00:00','2026-04-09 13:44:40','2026-04-09 13:46:03'),(6,19,330000.00,'cash','pending',NULL,'2026-04-09 14:12:26','2026-04-09 14:12:26'),(7,20,330000.00,'cash','success','2026-04-09 13:00:00','2026-04-09 14:50:54','2026-04-09 14:53:46'),(8,21,330000.00,'cash','pending',NULL,'2026-04-17 08:38:17','2026-04-17 08:38:17'),(9,22,330000.00,'cash','pending',NULL,'2026-04-19 08:17:11','2026-04-19 08:17:11');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `price_rules`
--

DROP TABLE IF EXISTS `price_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `price_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rule_name` varchar(255) NOT NULL,
  `route_id` int DEFAULT NULL COMMENT 'NULL = áp dụng tất cả tuyến',
  `bus_type_id` int DEFAULT NULL COMMENT 'NULL = áp dụng tất cả loại xe',
  `price_multiplier` decimal(5,2) DEFAULT NULL COMMENT '1.2 = tăng 20%',
  `price_delta` decimal(12,2) DEFAULT NULL COMMENT '+50000 hoặc -20000',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `priority` int NOT NULL DEFAULT '0' COMMENT 'Rule nào ưu tiên cao hơn',
  `status` varchar(20) NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  KEY `idx_pr_route` (`route_id`),
  KEY `idx_pr_bustype` (`bus_type_id`),
  KEY `idx_pr_dates` (`start_date`,`end_date`),
  CONSTRAINT `fk_pr_bustype` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`),
  CONSTRAINT `fk_pr_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `price_rules`
--

LOCK TABLES `price_rules` WRITE;
/*!40000 ALTER TABLE `price_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `price_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `route_fares`
--

DROP TABLE IF EXISTS `route_fares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `route_fares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int NOT NULL,
  `bus_type_id` int NOT NULL,
  `base_price` decimal(12,2) NOT NULL COMMENT 'Giá vé ngày thường. Ví dụ: 300000',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_route_bustype` (`route_id`,`bus_type_id`),
  KEY `idx_rf_route` (`route_id`),
  KEY `idx_rf_bustype` (`bus_type_id`),
  CONSTRAINT `fk_rf_bustype` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`),
  CONSTRAINT `fk_rf_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `route_fares`
--

LOCK TABLES `route_fares` WRITE;
/*!40000 ALTER TABLE `route_fares` DISABLE KEYS */;
/*!40000 ALTER TABLE `route_fares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `routes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `departure_location` varchar(100) NOT NULL,
  `arrival_location` varchar(100) NOT NULL,
  `distance_km` int DEFAULT NULL,
  `duration_est` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,'Sài Gòn','Đà Lạt',300,NULL);
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `refresh_token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_token` (`refresh_token`),
  KEY `sessions_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES (3,1,'404aefb3b1fd2f3b41c4e468409a8b66331f8fd3c18d3791cf42dd8f67df24186b539c7a66da3786263aa6bba99a667eba014d7c8dca5577267555ee52a8ff1e','2026-04-21 17:32:45','2026-04-07 17:32:45','2026-04-07 17:32:45'),(4,11,'a07fb588cdd4c0d92b8b00dd03df2d0e0ca9d57b64e85899f2cc46084320437bedcb575a78d80f51566a9bd601af8c10dc7bb06c75ad6eae2bd0062077f5317b','2026-04-23 07:09:38','2026-04-09 07:09:38','2026-04-09 07:09:38'),(5,11,'22b25bb62b99ce924541a539d4a6f693050cec4a5b9b94f998f0129915b386f960d8e357be9a495399bc8870ddfe6259ea9fdb0f04997161258d6ced36e08c1e','2026-04-23 07:09:57','2026-04-09 07:09:57','2026-04-09 07:09:57'),(6,2,'b3f135c79f9c53fa46349e1f4d8dfe1ebfe289ec59272d1fbcbc5e81427f8510b579c78424c2b9fd48213cfda893d0c6315ec7636b40044968fe6ae0a2e0ad8e','2026-04-23 07:10:00','2026-04-09 07:10:00','2026-04-09 07:10:00'),(7,2,'f8390ce6a2e670dbbcc97d3fbe3e883cadd3230c3ba099019b6bfd820391dc06382351ff4010a158bd1695fa7a5d59caa45919c58c948c562ad045bca768c0cb','2026-04-23 07:10:03','2026-04-09 07:10:03','2026-04-09 07:10:03'),(8,2,'1b7c68575e7813feaba6fb432e2651416ccbbb5fd0de723dac43c840c213377d5a7393ff0b5c3b0e14c34ec403cf96d142e7a4bc0ef283713ab2914047dc6cfb','2026-04-23 12:21:10','2026-04-09 12:21:10','2026-04-09 12:21:10'),(9,2,'4818a8cf97380b5aa9730df0184e1e59861b7db465adcde83ad57ef9e6ec071afd0f03bbaeb612d7e17e659cf121671e31355e3ad594b27b481c7a864baa24d4','2026-04-23 12:27:42','2026-04-09 12:27:42','2026-04-09 12:27:42'),(10,2,'cf2aaee2339d55cd6e48e8cf0cafa67d9a21ca573061b9a9bcf6d86840b99c3e7c9feb95a1b643a60a7bcf58274f40f6eca904df5f631c429c48b3bd9ac5b065','2026-04-23 12:31:28','2026-04-09 12:31:28','2026-04-09 12:31:28'),(11,2,'a74e7f0bacadb9c32663db403b468008fb220b995376f1ae288163e7c815a951a83040b1673ecbd4c9184efc9908340ee248dec16ee2c5a02ed56e726fb23e9c','2026-04-23 12:47:53','2026-04-09 12:47:53','2026-04-09 12:47:53'),(12,2,'c68b3142d6e6949cdf52e943ffe75a5f134b897ffb41843065d5cf0b3161208693716c2b5e0bc28e715ae79df3325d052808ed39977ae49b407199fecec2a892','2026-04-23 12:53:31','2026-04-09 12:53:31','2026-04-09 12:53:31'),(13,2,'3023f7b1c39ed8ff0edee42f030702a3e6533e4b7e9f210466a9809b872807f0a170be12e4b8159c90617b620829d5f50065b860638e68282fb24575b0ae3613','2026-04-23 13:19:59','2026-04-09 13:19:59','2026-04-09 13:19:59'),(14,2,'91fdb110b24b86bd1850837fadd2ff74f7674605c897e65f7c6e1169e14848760585bf7904cf74c4150f1c48e2a5fb65d4354508b3a332de7eecaed7f1058591','2026-04-23 13:43:59','2026-04-09 13:43:59','2026-04-09 13:43:59'),(15,2,'62fde8959caaf6fe3dce07eeaadd8e42fbc197e6a46e6925159db065c275b2c8a58b1496a4413a0b6fa6f53aea7a9fdf61f971e6ea8c80010cb0a1ada615b197','2026-04-23 14:48:44','2026-04-09 14:48:44','2026-04-09 14:48:44'),(16,2,'ce2c2c4acd3502fbf49c446f5963247cd583ec58b47731114ee41dc6cc392edfd26aac86f031f41642f765a7cbc323b6aa0868814bd20686ea473736d959a1da','2026-05-01 08:37:02','2026-04-17 08:37:02','2026-04-17 08:37:02'),(18,14,'efc9855adc1d56ba7a5a0cdb7f246ef35a851c3170dea494cca36badebf0ca771db0b0b1036e2aa043ebee948b0295f6b099f6bd96021b62b38b91de85fd8560','2026-05-03 08:09:20','2026-04-19 08:09:20','2026-04-19 08:09:20');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int DEFAULT NULL,
  `trip_seat_id` int DEFAULT NULL,
  `passenger_name` varchar(100) DEFAULT NULL,
  `passenger_phone` varchar(20) DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` enum('unused','used','cancelled') NOT NULL DEFAULT 'unused',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  UNIQUE KEY `unique_trip_seat_id` (`trip_seat_id`),
  KEY `idx_ticket_booking` (`booking_id`),
  KEY `idx_ticket_qr` (`qr_code`),
  CONSTRAINT `fk_tickets_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `fk_tickets_trip_seat` FOREIGN KEY (`trip_seat_id`) REFERENCES `trip_seats` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (20,22,3,'Ho Mink Khoa tesst','0123456789','55125D5700295276D1013F18A23D59A6','unused','2026-04-19 08:17:11','2026-04-19 08:17:11');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trip_seats`
--

DROP TABLE IF EXISTS `trip_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int DEFAULT NULL,
  `seat_number` varchar(10) NOT NULL,
  `status` enum('available','pending','booked') DEFAULT 'available',
  `pending_until` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_trip_seat` (`trip_id`,`seat_number`),
  KEY `idx_trip_seat_trip` (`trip_id`),
  CONSTRAINT `fk_trip_seats_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_seats`
--

LOCK TABLES `trip_seats` WRITE;
/*!40000 ALTER TABLE `trip_seats` DISABLE KEYS */;
INSERT INTO `trip_seats` VALUES (1,1,'A01','booked',NULL,'2026-04-09 19:31:05','2026-04-09 13:46:04'),(2,1,'A02','booked',NULL,'2026-04-09 20:00:01','2026-04-09 14:53:46'),(3,1,'A03','pending','2026-04-19 08:27:11','2026-04-17 15:38:07','2026-04-19 08:17:11');
/*!40000 ALTER TABLE `trip_seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `route_id` int DEFAULT NULL,
  `bus_id` int DEFAULT NULL,
  `departure_time` datetime NOT NULL,
  `arrival_time_expected` datetime DEFAULT NULL,
  `status` enum('scheduled','departing','completed','cancelled') DEFAULT 'scheduled',
  `cancel_policy` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_trip_route` (`route_id`),
  KEY `idx_trip_bus` (`bus_id`),
  CONSTRAINT `fk_trips_bus` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  CONSTRAINT `fk_trips_route` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,1,NULL,'2026-05-01 08:00:00',NULL,'scheduled',NULL,'2026-04-09 19:35:22','2026-04-09 19:35:22');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'customer',
  `status` varchar(20) NOT NULL DEFAULT 'active',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'$2b$10$QWuCwYQtm6yw5ae0DwncwuCxr2.D.3k5bH5.DJYPAH.Hx7fzA6gEq','user@gmail.com','Duc Nguyen','0943204547','customer','active','2026-04-07 14:40:47','2026-04-19 14:32:08'),(2,'$2b$10$kttYlr7b3jCgdz9OhGMp1OBV5jqZm/VtblG59pR7rVE5MccT9GbvW','userkhoa@gmail.com','Duc Nguyen','0943204549','customer','active','2026-04-09 07:00:31','2026-04-19 14:32:08'),(11,'$2b$10$uhWisySMH3bfjr0D2HRUF.iU5Dwp6BnmNZpj2eTxitS.aHBbYPose','userkhoa7@gmail.com','Duc Nguyen','0943204541','customer','active','2026-04-09 07:05:21','2026-04-19 14:32:08'),(12,'$2b$10$qUrEYvR/b2e1Dhgky9Zwku7IYfubW6onICu/yBmGoE6TYZKyvgsPi','userkhoa8@gmail.com','Duc Nguyen','0943204543','customer','active','2026-04-09 09:25:03','2026-04-19 14:32:08'),(13,'$2b$10$P3orteId49rWAmDESGGw..uCcaP2Jc.BiInS2XTsNv9Codi/MsIve','userkhoa9@gmail.com','Duc Nguyen','0943204544','customer','active','2026-04-09 09:32:06','2026-04-19 14:32:08'),(14,'$2b$10$9Dygfd3OeOTB.I2Wx.rpNetUjVe2dAyfcawRShh98GuinD865ZyGW','userkhoa48@gmail.com','Duc Nguyen','0943204041','customer','active','2026-04-19 08:07:59','2026-04-19 08:07:59');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 15:25:42
