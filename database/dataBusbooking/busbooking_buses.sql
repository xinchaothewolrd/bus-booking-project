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
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `license_plate` varchar(20) NOT NULL,
  `bus_type_id` int DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `status` enum('active','maintenance') NOT NULL DEFAULT 'active',
  `maintenance_note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_plate` (`license_plate`),
  UNIQUE KEY `license_plate_2` (`license_plate`),
  UNIQUE KEY `license_plate_3` (`license_plate`),
  UNIQUE KEY `license_plate_4` (`license_plate`),
  UNIQUE KEY `license_plate_5` (`license_plate`),
  UNIQUE KEY `license_plate_6` (`license_plate`),
  UNIQUE KEY `license_plate_7` (`license_plate`),
  UNIQUE KEY `license_plate_8` (`license_plate`),
  UNIQUE KEY `license_plate_9` (`license_plate`),
  UNIQUE KEY `license_plate_10` (`license_plate`),
  UNIQUE KEY `license_plate_11` (`license_plate`),
  UNIQUE KEY `license_plate_12` (`license_plate`),
  UNIQUE KEY `license_plate_13` (`license_plate`),
  UNIQUE KEY `license_plate_14` (`license_plate`),
  UNIQUE KEY `license_plate_15` (`license_plate`),
  UNIQUE KEY `license_plate_16` (`license_plate`),
  UNIQUE KEY `license_plate_17` (`license_plate`),
  UNIQUE KEY `license_plate_18` (`license_plate`),
  UNIQUE KEY `license_plate_19` (`license_plate`),
  UNIQUE KEY `license_plate_20` (`license_plate`),
  UNIQUE KEY `license_plate_21` (`license_plate`),
  UNIQUE KEY `license_plate_22` (`license_plate`),
  UNIQUE KEY `license_plate_23` (`license_plate`),
  UNIQUE KEY `license_plate_24` (`license_plate`),
  UNIQUE KEY `license_plate_25` (`license_plate`),
  UNIQUE KEY `license_plate_26` (`license_plate`),
  UNIQUE KEY `license_plate_27` (`license_plate`),
  UNIQUE KEY `license_plate_28` (`license_plate`),
  UNIQUE KEY `license_plate_29` (`license_plate`),
  UNIQUE KEY `license_plate_30` (`license_plate`),
  UNIQUE KEY `license_plate_31` (`license_plate`),
  KEY `bus_type_id` (`bus_type_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`bus_type_id`) REFERENCES `bus_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
INSERT INTO `buses` VALUES (1,'51A-12345',1,'Nguyen Van A','active',NULL),(2,'51B-67890',2,'Tran Van B','active',NULL),(3,'51C-22222',2,'Le Van C','maintenance',NULL);
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
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
