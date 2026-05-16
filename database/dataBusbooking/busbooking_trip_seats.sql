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
-- Table structure for table `trip_seats`
--

DROP TABLE IF EXISTS `trip_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trip_seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int DEFAULT NULL,
  `seat_number` varchar(10) NOT NULL,
  `status` enum('available','pending','booked') NOT NULL DEFAULT 'available',
  `pending_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `trip_seats_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trip_seats`
--

LOCK TABLES `trip_seats` WRITE;
/*!40000 ALTER TABLE `trip_seats` DISABLE KEYS */;
INSERT INTO `trip_seats` VALUES (17,7,'A1','booked',NULL),(18,7,'A2','pending',NULL),(19,7,'A3','booked',NULL),(20,7,'A4','booked',NULL),(21,7,'A5','booked',NULL),(22,7,'A6','booked',NULL),(23,7,'A7','booked',NULL),(24,7,'A8','booked',NULL),(25,7,'A9','booked',NULL),(26,7,'A10','booked',NULL),(27,7,'A11','booked',NULL),(28,7,'A12','available',NULL),(29,7,'A13','available',NULL),(30,7,'A14','available',NULL),(31,7,'A15','available',NULL),(32,7,'B1','booked',NULL),(33,7,'B2','available',NULL),(34,7,'B3','available',NULL),(35,7,'B4','available',NULL),(36,7,'B5','available',NULL),(37,7,'B6','available',NULL),(38,7,'B7','available',NULL),(39,7,'B8','available',NULL),(40,7,'B9','available',NULL),(41,7,'B10','available',NULL),(42,7,'B11','available',NULL),(43,7,'B12','available',NULL),(44,7,'B13','available',NULL),(45,7,'B14','available',NULL),(46,7,'B15','available',NULL);
/*!40000 ALTER TABLE `trip_seats` ENABLE KEYS */;
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
