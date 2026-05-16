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
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`),
  UNIQUE KEY `email_12` (`email`),
  UNIQUE KEY `email_13` (`email`),
  UNIQUE KEY `email_14` (`email`),
  UNIQUE KEY `email_15` (`email`),
  UNIQUE KEY `email_16` (`email`),
  UNIQUE KEY `email_17` (`email`),
  UNIQUE KEY `email_18` (`email`),
  UNIQUE KEY `email_19` (`email`),
  UNIQUE KEY `email_20` (`email`),
  UNIQUE KEY `email_21` (`email`),
  UNIQUE KEY `email_22` (`email`),
  UNIQUE KEY `email_23` (`email`),
  UNIQUE KEY `email_24` (`email`),
  UNIQUE KEY `email_25` (`email`),
  UNIQUE KEY `email_26` (`email`),
  UNIQUE KEY `email_27` (`email`),
  UNIQUE KEY `email_28` (`email`),
  UNIQUE KEY `email_29` (`email`),
  UNIQUE KEY `email_30` (`email`),
  UNIQUE KEY `email_31` (`email`),
  UNIQUE KEY `email_32` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `phone_2` (`phone`),
  UNIQUE KEY `phone_3` (`phone`),
  UNIQUE KEY `phone_4` (`phone`),
  UNIQUE KEY `phone_5` (`phone`),
  UNIQUE KEY `phone_6` (`phone`),
  UNIQUE KEY `phone_7` (`phone`),
  UNIQUE KEY `phone_8` (`phone`),
  UNIQUE KEY `phone_9` (`phone`),
  UNIQUE KEY `phone_10` (`phone`),
  UNIQUE KEY `phone_11` (`phone`),
  UNIQUE KEY `phone_12` (`phone`),
  UNIQUE KEY `phone_13` (`phone`),
  UNIQUE KEY `phone_14` (`phone`),
  UNIQUE KEY `phone_15` (`phone`),
  UNIQUE KEY `phone_16` (`phone`),
  UNIQUE KEY `phone_17` (`phone`),
  UNIQUE KEY `phone_18` (`phone`),
  UNIQUE KEY `phone_19` (`phone`),
  UNIQUE KEY `phone_20` (`phone`),
  UNIQUE KEY `phone_21` (`phone`),
  UNIQUE KEY `phone_22` (`phone`),
  UNIQUE KEY `phone_23` (`phone`),
  UNIQUE KEY `phone_24` (`phone`),
  UNIQUE KEY `phone_25` (`phone`),
  UNIQUE KEY `phone_26` (`phone`),
  UNIQUE KEY `phone_27` (`phone`),
  UNIQUE KEY `phone_28` (`phone`),
  UNIQUE KEY `phone_29` (`phone`),
  UNIQUE KEY `phone_30` (`phone`),
  UNIQUE KEY `phone_31` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'$2b$10$ASs8Q9KYRkIChZ.64gua9uiRA3DA7fJyGezsj9NoP5EbVD30wWBZy','a@gmail.com','Van A Nguyen','0123456789','customer','active','2026-04-22 15:24:29','2026-04-22 15:24:29'),(2,'$2b$10$QsFB6QPDkFcVoisdOtw65OZfVzR.0eoaFH4zFP.X/5e12NrDnynoG','admin@gmail.com','Admin 1','0388541226','admin','active','2026-04-24 03:38:15','2026-04-24 03:38:15'),(3,'$2b$10$pxospTuZxwA8NJ11MkPdDeEFULrSIzgMCQt3gWF6jKwTsjo3QWnmW','ducdepzai32@gmail.com','Nguyễn Đức','01234567890','customer','active','2026-05-12 14:47:40','2026-05-12 14:47:40');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
