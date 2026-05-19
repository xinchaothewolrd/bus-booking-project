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


--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `payment_method` enum('momo','zalo_pay','bank_transfer','cash','card') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_time` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,'cash',500000.00,'pending',NULL,'2026-05-06 15:13:04','2026-05-06 15:13:04'),(2,2,'cash',250000.00,'pending',NULL,'2026-05-07 13:32:00','2026-05-07 13:32:00'),(3,3,'cash',250000.00,'pending',NULL,'2026-05-07 13:36:19','2026-05-07 13:36:19'),(4,4,'cash',250000.00,'pending',NULL,'2026-05-07 13:37:05','2026-05-07 13:37:05'),(5,5,'cash',250000.00,'pending',NULL,'2026-05-07 13:55:21','2026-05-07 13:55:21'),(6,6,'cash',250000.00,'success',NULL,'2026-05-07 13:59:54','2026-05-07 14:00:24'),(7,7,'cash',250000.00,'success',NULL,'2026-05-07 14:18:10','2026-05-07 14:18:42'),(8,10,'cash',500000.00,'success',NULL,'2026-05-10 15:24:58','2026-05-10 15:26:11'),(9,11,'cash',250000.00,'success','2026-05-12 14:46:26','2026-05-12 14:45:37','2026-05-12 14:46:26'),(10,12,'cash',250000.00,'success','2026-05-12 14:48:59','2026-05-12 14:48:35','2026-05-12 14:48:59'),(11,13,'cash',250000.00,'success','2026-05-12 14:59:23','2026-05-12 14:58:58','2026-05-12 14:59:23'),(12,14,'cash',250000.00,'success','2026-05-12 15:13:57','2026-05-12 15:13:32','2026-05-12 15:13:57'),(13,15,'cash',250000.00,'success','2026-05-12 15:23:14','2026-05-12 15:22:47','2026-05-12 15:23:14'),(14,16,'cash',250000.00,'success','2026-05-12 15:28:51','2026-05-12 15:28:22','2026-05-12 15:28:51');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
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

-- Dump completed on 2026-05-16 10:29:48
