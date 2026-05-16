-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: busbooking
-- ------------------------------------------------------
-- Server version	9.5.0

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
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '90888fe6-af61-11f0-b499-7abb6701acc5:1-2796';

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `trip_seat_id` int NOT NULL,
  `passenger_name` varchar(100) DEFAULT NULL,
  `passenger_phone` varchar(20) DEFAULT NULL,
  `pickup_stop_id` int DEFAULT NULL,
  `dropoff_stop_id` int DEFAULT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `status` enum('unused','used','cancelled') NOT NULL DEFAULT 'unused',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  UNIQUE KEY `qr_code_2` (`qr_code`),
  UNIQUE KEY `qr_code_3` (`qr_code`),
  UNIQUE KEY `qr_code_4` (`qr_code`),
  UNIQUE KEY `qr_code_5` (`qr_code`),
  UNIQUE KEY `qr_code_6` (`qr_code`),
  UNIQUE KEY `qr_code_7` (`qr_code`),
  UNIQUE KEY `qr_code_8` (`qr_code`),
  UNIQUE KEY `qr_code_9` (`qr_code`),
  UNIQUE KEY `qr_code_10` (`qr_code`),
  UNIQUE KEY `qr_code_11` (`qr_code`),
  UNIQUE KEY `qr_code_12` (`qr_code`),
  UNIQUE KEY `qr_code_13` (`qr_code`),
  UNIQUE KEY `qr_code_14` (`qr_code`),
  UNIQUE KEY `qr_code_15` (`qr_code`),
  UNIQUE KEY `qr_code_16` (`qr_code`),
  UNIQUE KEY `qr_code_17` (`qr_code`),
  UNIQUE KEY `qr_code_18` (`qr_code`),
  UNIQUE KEY `qr_code_19` (`qr_code`),
  UNIQUE KEY `qr_code_20` (`qr_code`),
  UNIQUE KEY `qr_code_21` (`qr_code`),
  UNIQUE KEY `qr_code_22` (`qr_code`),
  UNIQUE KEY `qr_code_23` (`qr_code`),
  UNIQUE KEY `qr_code_24` (`qr_code`),
  UNIQUE KEY `qr_code_25` (`qr_code`),
  UNIQUE KEY `qr_code_26` (`qr_code`),
  UNIQUE KEY `qr_code_27` (`qr_code`),
  UNIQUE KEY `qr_code_28` (`qr_code`),
  UNIQUE KEY `qr_code_29` (`qr_code`),
  UNIQUE KEY `qr_code_30` (`qr_code`),
  UNIQUE KEY `qr_code_31` (`qr_code`),
  KEY `booking_id` (`booking_id`),
  KEY `trip_seat_id` (`trip_seat_id`),
  CONSTRAINT `tickets_ibfk_61` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tickets_ibfk_62` FOREIGN KEY (`trip_seat_id`) REFERENCES `trip_seats` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,1,24,'Nguyễn Văn A','0993347561',NULL,NULL,'OB-1-A8-0NWG','cancelled','2026-05-06 15:13:04','2026-05-06 15:24:00'),(2,1,25,'Nguyễn Văn A','0993347561',NULL,NULL,'OB-1-A9-PBMV','cancelled','2026-05-06 15:13:04','2026-05-06 15:24:00'),(3,2,31,'Tran Thi B','0112478893',NULL,NULL,'OB-2-A15-U2A4','cancelled','2026-05-07 13:32:00','2026-05-07 13:47:00'),(4,3,31,'Tran Thi B','0112478893',NULL,NULL,'OB-3-A15-1NZI','unused','2026-05-07 13:36:19','2026-05-07 13:36:19'),(5,4,30,'Trần thị B','033142578',NULL,NULL,'OB-4-A14-ABFH','cancelled','2026-05-07 13:37:04','2026-05-07 13:48:00'),(6,5,26,'Nguyễn thị B','0123456789',NULL,NULL,'OB-5-A10-VBBE','cancelled','2026-05-07 13:55:21','2026-05-07 14:06:00'),(7,6,19,'thi b','0123456789',NULL,NULL,'OB-6-A3-CQZT','unused','2026-05-07 13:59:54','2026-05-07 13:59:54'),(8,7,24,'van a','0000122245',NULL,NULL,'OB-7-A8-HPKJ','unused','2026-05-07 14:18:10','2026-05-07 14:18:10'),(9,10,20,'Nguyen Van A','12223556',1,2,'OB-10-A4-BJCV','unused','2026-05-10 15:24:58','2026-05-10 15:24:58'),(10,10,23,'Nguyen Van A','12223556',1,2,'OB-10-A7-SV4F','unused','2026-05-10 15:24:58','2026-05-10 15:24:58'),(11,11,21,'Nguyễn Văn A','02231478896',1,2,'OB-11-A5-GT2H','unused','2026-05-12 14:45:37','2026-05-12 14:45:37'),(12,12,22,'Nguyễn Đức','02231456789',1,2,'OB-12-A6-U8D9','unused','2026-05-12 14:48:35','2026-05-12 14:48:35'),(13,13,32,'Van A','0123345678',1,2,'OB-13-B1-D4W9','unused','2026-05-12 14:58:58','2026-05-12 14:58:58'),(14,14,25,'Hihi','011234565',1,2,'OB-14-A9-UIM8','unused','2026-05-12 15:13:32','2026-05-12 15:13:32'),(15,15,26,'Nhasd','0122234567',1,2,'OB-15-A10-OJIB','unused','2026-05-12 15:22:47','2026-05-12 15:22:47'),(16,16,27,'asdad','0123456789',1,2,'OB-16-A11-11CI','unused','2026-05-12 15:28:22','2026-05-12 15:28:22');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-16 10:29:49
