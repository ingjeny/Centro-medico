-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 192.168.124.186    Database: consultorio
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `consultorio` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `consultorio`;

--
-- Table structure for table `campos_especialidad`
--

DROP TABLE IF EXISTS `campos_especialidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campos_especialidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `especialidad_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etiqueta` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('texto','textarea','numero','select','checkbox','fecha') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'texto',
  `opciones` text COLLATE utf8mb4_unicode_ci,
  `unidad` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `requerido` tinyint(1) NOT NULL DEFAULT '0',
  `seccion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Datos específicos',
  `orden` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `especialidad_id` (`especialidad_id`),
  CONSTRAINT `campos_especialidad_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campos_especialidad`
--

LOCK TABLES `campos_especialidad` WRITE;
/*!40000 ALTER TABLE `campos_especialidad` DISABLE KEYS */;
INSERT INTO `campos_especialidad` VALUES (1,2,'fum','Fecha última menstruación (FUM)','fecha',NULL,NULL,0,'Ginecología',1),(2,2,'semanas_gest','Semanas de gestación','numero',NULL,'sem',0,'Ginecología',2),(3,2,'fur','Fecha última revisión','fecha',NULL,NULL,0,'Ginecología',3),(4,2,'num_embarazos','Número de embarazos','numero',NULL,NULL,0,'Ginecología',4),(5,2,'num_partos','Número de partos','numero',NULL,NULL,0,'Ginecología',5),(6,2,'anticoncepcion','Método anticonceptivo','select','[\"Ninguno\",\"Hormonal oral\",\"Inyectable\",\"DIU\",\"Implante\",\"Condón\",\"Ligadura\",\"Otro\"]',NULL,0,'Ginecología',6),(7,2,'ecografia','Hallazgos ecografía','textarea',NULL,NULL,0,'Ginecología',7),(8,2,'papanicolaou','Resultado Papanicolaou','texto',NULL,NULL,0,'Ginecología',8),(9,3,'piezas_afectadas','Piezas dentales afectadas','texto',NULL,NULL,0,'Odontología',1),(10,3,'procedimiento','Procedimiento realizado','select','[\"Extracción\",\"Obturación\",\"Endodoncia\",\"Limpieza\",\"Profilaxis\",\"Ortodoncia\",\"Corona\",\"Implante\",\"Otro\"]',NULL,0,'Odontología',2),(11,3,'anestesia','Anestesia aplicada','texto',NULL,NULL,0,'Odontología',3),(12,3,'odontograma_obs','Observaciones odontograma','textarea',NULL,NULL,0,'Odontología',4),(13,3,'rx_dental','Hallazgos Rx dental','textarea',NULL,NULL,0,'Radiología',5),(14,3,'proximo_control','Próximo control','fecha',NULL,NULL,0,'Odontología',6),(15,4,'tipo_estudio','Tipo de estudio','select','[\"Rx simple\",\"Rx contrastada\",\"Ecografía\",\"TAC\",\"RMN\",\"Mamografía\",\"Densitometría\",\"Otro\"]',NULL,0,'Radiología',1),(16,4,'region','Región anatómica','texto',NULL,NULL,0,'Radiología',2),(17,4,'tecnica','Técnica / proyección','texto',NULL,NULL,0,'Radiología',3),(18,4,'hallazgos','Hallazgos / Descripción','textarea',NULL,NULL,0,'Radiología',4),(19,4,'conclusion','Conclusión / Impresión','textarea',NULL,NULL,0,'Radiología',5),(20,4,'recomendacion','Recomendaciones','textarea',NULL,NULL,0,'Radiología',6),(21,5,'uudq','UUDQ','texto',NULL,NULL,1,'Datos específicos',0);
/*!40000 ALTER TABLE `campos_especialidad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas`
--

DROP TABLE IF EXISTS `citas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paciente_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pendiente','confirmada','completada','cancelada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente',
  `tipo_pago` enum('pagada','pendiente_pago','familiar','cortesia') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pendiente_pago',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `consultorio_id` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `fk_cit_cons` (`consultorio_id`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas`
--

LOCK TABLES `citas` WRITE;
/*!40000 ALTER TABLE `citas` DISABLE KEYS */;
INSERT INTO `citas` VALUES (1,1,2,'2026-06-10','12:00:00','DOLOR EN EL CUERPO','cancelada','pendiente_pago','',1,'2026-06-10 16:23:24'),(2,1,2,'2026-06-10','08:30:00','FIEBRE','pendiente','pendiente_pago','',1,'2026-06-10 16:25:59'),(3,1,2,'2026-06-10','15:00:00','FREEE','pendiente','pendiente_pago','',1,'2026-06-10 16:26:22'),(4,2,1,'2026-06-11','11:30:00','alergia','pendiente','pagada',NULL,1,'2026-06-10 20:57:04'),(5,3,2,'2026-06-11','07:30:00','FIEBRE','pendiente','pagada',NULL,1,'2026-06-10 21:04:14');
/*!40000 ALTER TABLE `citas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultorios`
--

DROP TABLE IF EXISTS `consultorios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultorios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nit` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultorios`
--

LOCK TABLES `consultorios` WRITE;
/*!40000 ALTER TABLE `consultorios` DISABLE KEYS */;
INSERT INTO `consultorios` VALUES (1,'Consultorio Principal','900000000-1',NULL,NULL,'Bogotá',NULL,1,'2026-06-11 21:22:42');
/*!40000 ALTER TABLE `consultorios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `especialidades`
--

DROP TABLE IF EXISTS `especialidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `especialidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '#6366f1',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `especialidades`
--

LOCK TABLES `especialidades` WRITE;
/*!40000 ALTER TABLE `especialidades` DISABLE KEYS */;
INSERT INTO `especialidades` VALUES (1,'Medicina General','Consulta general, signos vitales y tratamiento básico','#6366f1',1,'2026-06-11 20:55:06'),(2,'Ginecología','Control prenatal, última menstruación, ecografía, etc.','#ec4899',1,'2026-06-11 20:55:06'),(3,'Odontología','Piezas dentales, procedimientos orales, odontograma','#0ea5e9',1,'2026-06-11 20:55:06'),(4,'Radiología','Lectura e interpretación de imágenes diagnósticas','#f59e0b',1,'2026-06-11 20:55:06'),(5,'GINECOLOGIA','GINECOLOGIA CLINICA','#f59e0b',1,'2026-06-11 20:58:07');
/*!40000 ALTER TABLE `especialidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historias_clinicas`
--

DROP TABLE IF EXISTS `historias_clinicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias_clinicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cita_id` int DEFAULT NULL,
  `paciente_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `fecha` date NOT NULL,
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci,
  `sintomas` text COLLATE utf8mb4_unicode_ci,
  `examen_fisico` text COLLATE utf8mb4_unicode_ci,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `tratamiento` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tension_arterial` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia_cardiaca` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia_respiratoria` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperatura` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `talla` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `saturacion_o2` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `datos_extra` json DEFAULT NULL,
  `consultorio_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `cita_id` (`cita_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `fk_hc_cons` (`consultorio_id`),
  CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_4` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historias_clinicas`
--

LOCK TABLES `historias_clinicas` WRITE;
/*!40000 ALTER TABLE `historias_clinicas` DISABLE KEYS */;
INSERT INTO `historias_clinicas` VALUES (1,NULL,1,2,'2026-06-10','tiene un dolor de cabeza','ha tenido desde que dias','erupciones','tienen fiebre y dengue','pastillas y medicamentos cada 8 hroas','2026-06-10 16:42:51','120/80','73','16','37','80','178','98','ninguna',NULL,1),(2,NULL,3,2,'2026-06-10','tiene fiebre','se le quito','ojos rojos','dengue','medicamentos','2026-06-10 21:06:06','120/80','73','16','37','80','','98','ninguna',NULL,1);
/*!40000 ALTER TABLE `historias_clinicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incapacidades`
--

DROP TABLE IF EXISTS `incapacidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incapacidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historia_id` int DEFAULT NULL,
  `paciente_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `fecha_emision` date NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `dias` int NOT NULL,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `tipo` enum('reposo','incapacidad_laboral','reposo_relativo') COLLATE utf8mb4_unicode_ci DEFAULT 'reposo',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `consultorio_id` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `historia_id` (`historia_id`),
  KEY `paciente_id` (`paciente_id`),
  KEY `doctor_id` (`doctor_id`),
  KEY `fk_inc_cons` (`consultorio_id`),
  CONSTRAINT `incapacidades_ibfk_1` FOREIGN KEY (`historia_id`) REFERENCES `historias_clinicas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `incapacidades_ibfk_2` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `incapacidades_ibfk_3` FOREIGN KEY (`doctor_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `incapacidades_ibfk_4` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incapacidades`
--

LOCK TABLES `incapacidades` WRITE;
/*!40000 ALTER TABLE `incapacidades` DISABLE KEYS */;
INSERT INTO `incapacidades` VALUES (1,1,1,2,'2026-06-10','2026-06-10','2026-06-11',2,'dengue ','reposo','ningun movimiento estar en masa',1,'2026-06-10 16:43:33'),(2,2,3,2,'2026-06-10','2026-06-10','2026-06-12',3,'dengue','incapacidad_laboral','estar en reposo',1,'2026-06-10 21:06:46');
/*!40000 ALTER TABLE `incapacidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medicamentos`
--

DROP TABLE IF EXISTS `medicamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medicamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `historia_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `historia_id` (`historia_id`),
  CONSTRAINT `medicamentos_ibfk_1` FOREIGN KEY (`historia_id`) REFERENCES `historias_clinicas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medicamentos`
--

LOCK TABLES `medicamentos` WRITE;
/*!40000 ALTER TABLE `medicamentos` DISABLE KEYS */;
INSERT INTO `medicamentos` VALUES (1,1,'acetaminofen','400 mg','cada 8 horas','7 dias','tomar antes de la comida'),(2,2,'acetaminofen','800','cada 8 horas','7 dias','tomar antes de la comida');
/*!40000 ALTER TABLE `medicamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pacientes`
--

DROP TABLE IF EXISTS `pacientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` enum('M','F','Otro') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_sangre` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alergias` text COLLATE utf8mb4_unicode_ci,
  `antecedentes` text COLLATE utf8mb4_unicode_ci,
  `consultorio_id` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula` (`cedula`),
  KEY `fk_pac_cons` (`consultorio_id`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pacientes`
--

LOCK TABLES `pacientes` WRITE;
/*!40000 ALTER TABLE `pacientes` DISABLE KEYS */;
INSERT INTO `pacientes` VALUES (1,'1094426081','BRENDA XIMENA','RIOS ROPERO','2026-06-03','F','3177159427','brendabbrios@gmail.com','Cucuta AEROPUERTO AV 0 CALLE 13-26','O+','NINGUNA','NINGUNA',1,'2026-06-10 16:22:48'),(2,'111111','pepito perez','perez','2026-04-01','M','sssssssssssssss','ssssss@pepitogmail','sssssss','B+','ssss','ssss',1,'2026-06-10 20:55:50'),(3,'11121212','MARIA PEREZ','OSPINA','2026-06-04','M','wwwwwwwww','www@gmail.com','ssssssssssss','A-','sssssssssssssss','ssssfccc',1,'2026-06-10 21:03:46');
/*!40000 ALTER TABLE `pacientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('admin','doctor','secretaria') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'secretaria',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `especialidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidad_id` int DEFAULT NULL,
  `consultorio_id` int DEFAULT NULL,
  `firma_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `especialidad_id` (`especialidad_id`),
  KEY `fk_usr_cons` (`consultorio_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`especialidad_id`) REFERENCES `especialidades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`consultorio_id`) REFERENCES `consultorios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador','admin@consultorio.com','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','admin',1,'2026-06-10 15:39:03',NULL,NULL,NULL,NULL),(2,'Medico especialista','doctor@consultorio.com','$2a$10$4ibvvzi1v2QgMhrGSMdOm.fygNkXdi2sTrec.zkuYKF1gX2Ya8oYi','doctor',1,'2026-06-10 16:00:57',NULL,NULL,NULL,NULL),(3,'Secretaria','secretaria@consultorio.com','$2a$10$VMY0GSwpHmGi/wtHXM1JuO/9ym2ntLr0.7UnisDuWaqpJhVySGln.','secretaria',1,'2026-06-10 16:20:58',NULL,NULL,NULL,NULL),(4,'Dr. Juan Pérez','admin@gmail.com','$2a$10$KxUOSqB8bAOJzm8dcwfBYeApvUHAW41SelNk95ZWPIwrcfBy1jWmW','admin',1,'2026-06-11 20:56:20',NULL,NULL,NULL,NULL),(5,'ginecologo','gine@gmail.com','$2a$10$UfpAEa9Gv1CpK0TeFOugeOlcsL1t6KMbju9PqPHrKxQOoO6J1M60a','doctor',1,'2026-06-11 20:58:58',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-02 12:36:44
