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
  PRIMARY KEY (`id`),
  KEY `route_id` (`route_id`),
  KEY `bus_id` (`bus_id`),
  CONSTRAINT `trips_ibfk_61` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `trips_ibfk_62` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips`
--

LOCK TABLES `trips` WRITE;
/*!40000 ALTER TABLE `trips` DISABLE KEYS */;
INSERT INTO `trips` VALUES (1,1,1,'2026-05-05 08:00:00','2026-05-05 14:00:00','scheduled','Hủy trước 24h hoàn 100%'),(2,1,2,'2026-05-05 22:00:00','2026-05-05 04:00:00','scheduled','Hủy trước 12h hoàn 50%'),(3,2,2,'2026-05-01 07:00:00','2026-05-01 15:00:00','scheduled','Không hoàn'),(4,1,1,'2026-05-05 09:00:00','2026-05-05 15:00:00','scheduled','Hủy trước 24h hoàn 100%'),(7,1,2,'2026-05-20 08:00:00','2026-05-20 12:00:00','scheduled','Hủy trước 24h hoàn tiền 100%, hủy sau 24h mất trắng ráng chịu!');
/*!40000 ALTER TABLE `trips` ENABLE KEYS */;
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
