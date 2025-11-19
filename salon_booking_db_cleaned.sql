-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 19, 2025 at 01:17 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `salon_booking_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointmenthistory`
--

CREATE TABLE `appointmenthistory` (
  `history_id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `client_name` varchar(255) NOT NULL,
  `service_name` varchar(255) NOT NULL,
  `service_price` decimal(10,2) NOT NULL,
  `service_category` varchar(100) DEFAULT NULL,
  `service_description` text DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `changed_by` varchar(255) DEFAULT 'system',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointmenthistory`
--

INSERT INTO `appointmenthistory` (`history_id`, `appointment_id`, `client_name`, `service_name`, `service_price`, `service_category`, `service_description`, `appointment_date`, `start_time`, `end_time`, `notes`, `status`, `staff_id`, `changed_by`, `created_at`) VALUES
(1, 15, 'lol Patel', 'Brazilian Wax', 70.00, 'Waxing & Hair Removal', 'Complete hair removal from the pubic area.', '2025-10-03', '14:30:00', '12:30:00', '', 'pending', 11, 'Test Administrator', '2025-09-24 23:49:26'),
(10, 16, 'Akshat Patel', 'Classic Pedicure', 55.00, 'Nail Services', 'Standard pedicure with foot care and polish.', '2025-09-27', '14:00:00', '16:30:00', '', 'pending', 14, 'Test Administrator', '2025-09-25 12:32:43'),
(12, 17, 'hi bye', 'Gel Manicure', 65.00, 'Nail Services', 'Durable gel nail polish application.', '2025-11-13', '12:00:00', '13:00:00', '', 'pending', NULL, 'client', '2025-11-13 03:50:36'),
(13, 18, 'Bob TheBuilder', 'Paraffin Wax (Add-On)', 20.00, 'Nail Services', 'An add-on to soften and moisturize hands or feet.', '2025-11-13', '11:30:00', '11:45:00', '', 'pending', NULL, 'client', '2025-11-13 06:59:38'),
(14, 19, 'Bob bye', 'Shellac Manicure', 55.00, 'Nail Services', 'Long-lasting gel polish manicure.', '2000-01-01', '00:00:00', '01:00:00', '', 'pending', NULL, 'client', '2025-11-13 08:24:12'),
(15, 20, 'Bob TheBuilder', 'Shellac Manicure', 55.00, 'Nail Services', 'Long-lasting gel polish manicure.', '0000-00-00', '00:00:00', '00:00:00', '', 'pending', NULL, 'client', '2025-11-19 00:09:45');

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `appointment_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `recurring_id` int(11) DEFAULT NULL,
  `is_recurring_instance` tinyint(1) DEFAULT 0,
  `buffer_time_minutes` int(11) DEFAULT 0 COMMENT 'Time needed before/after appointment',
  `internal_notes` text DEFAULT NULL,
  `source` enum('walk_in','phone','online','referral','other') DEFAULT 'phone',
  `is_no_show` tinyint(1) DEFAULT 0,
  `no_show_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`appointment_id`, `client_id`, `service_id`, `appointment_date`, `start_time`, `end_time`, `notes`, `status`, `staff_id`, `recurring_id`, `is_recurring_instance`, `buffer_time_minutes`, `internal_notes`, `source`, `is_no_show`, `no_show_reason`) VALUES
(16, 1, 22, '2025-09-27', '14:00:00', '16:30:00', '', 'confirmed', 14, NULL, 0, 0, NULL, 'phone', 0, NULL),
(17, 7, 21, '2025-11-13', '12:00:00', '13:00:00', 'Staff member is unavailable at this time', 'confirmed', NULL, NULL, 0, 0, NULL, 'phone', 0, NULL),
(18, 7, 27, '2025-11-13', '11:30:00', '11:45:00', '', 'confirmed', NULL, NULL, 0, 0, NULL, 'phone', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `appointment_reminders`
--

CREATE TABLE `appointment_reminders` (
  `reminder_id` int(11) NOT NULL,
  `appointment_id` int(11) NOT NULL,
  `reminder_type` enum('24h','2h','30m','custom') NOT NULL,
  `scheduled_for` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `sent_at` timestamp NULL DEFAULT NULL,
  `sent_via` enum('email','sms','in_app') DEFAULT NULL,
  `status` enum('pending','sent','failed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certifications`
--

CREATE TABLE `certifications` (
  `certification_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `certification_name` varchar(200) NOT NULL,
  `issuing_organization` varchar(200) DEFAULT NULL,
  `issue_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `certificate_number` varchar(100) DEFAULT NULL,
  `document_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `changelogs`
--

CREATE TABLE `changelogs` (
  `log_id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `action` varchar(20) NOT NULL,
  `changed_by` varchar(100) DEFAULT NULL,
  `changes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `changelogs`
--

INSERT INTO `changelogs` (`log_id`, `entity_type`, `entity_id`, `action`, `changed_by`, `changes`, `created_at`) VALUES
(1, 'appointment', 11, 'delete', 'Test Administrator', '{\"old\":{\"appointment_id\":11,\"client_id\":7,\"service_id\":21,\"appointment_date\":\"2025-10-04T04:00:00.000Z\",\"start_time\":\"09:00:00\",\"end_time\":\"10:00:00\",\"notes\":\"sadge\",\"status\":\"declined\",\"staff_id\":null},\"new\":null}', '2025-09-24 21:42:51'),
(2, 'appointment', 12, 'delete', 'Test Administrator', '{\"old\":{\"appointment_id\":12,\"client_id\":7,\"service_id\":26,\"appointment_date\":\"2025-10-04T04:00:00.000Z\",\"start_time\":\"10:30:00\",\"end_time\":\"10:45:00\",\"notes\":\"kekw\",\"status\":\"pending\",\"staff_id\":null},\"new\":null}', '2025-09-24 21:52:16'),
(3, 'appointment', 13, 'delete', 'Test Administrator', '{\"old\":{\"appointment_id\":13,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-09T04:00:00.000Z\",\"start_time\":\"09:00:00\",\"end_time\":\"09:30:00\",\"notes\":\"Booking error – please select another time\",\"status\":\"declined\",\"staff_id\":null},\"new\":null}', '2025-09-24 21:52:22'),
(4, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"13:30\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 22:57:54'),
(5, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"15:30\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 23:00:51'),
(6, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"16:30\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 23:01:40'),
(7, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"15:30\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 23:03:42'),
(8, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"16:30\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 23:04:36'),
(9, 'appointment', 15, 'update', NULL, '{\"new\":{\"notes\":\"\",\"staff_id\":11,\"appointment_date\":\"2025-10-01\",\"start_time\":\"12:00\",\"changed_by\":\"Test Administrator\",\"appointment_id\":\"15\"}}', '2025-09-24 23:06:26'),
(10, 'client', 1, 'update', 'Test Administrator', '{\"old\":{\"client_id\":1,\"first_name\":\"Akshat\",\"last_name\":\"Patel\",\"email\":\"akshatpat3l@gmail.com\",\"phone_number\":\"1234567890\",\"address\":\"15 Heathrow Lane\",\"city\":\"Bolton\",\"postal_code\":\"L7E 2E1\"},\"new\":{\"first_name\":\"lol\",\"last_name\":\"Patel\",\"email\":\"akshatpat3l@gmail.com\",\"phone_number\":\"1234567890\",\"address\":\"15 Heathrow Lane\",\"city\":\"Bolton\",\"postal_code\":\"L7E 2E1\"}}', '2025-09-24 23:38:22'),
(11, 'appointment', 15, 'update', 'Unknown', '{\"old\":{\"appointment_id\":15,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-01T04:00:00.000Z\",\"start_time\":\"12:00:00\",\"end_time\":\"12:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":11},\"new\":{\"appointment_id\":15,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-01T04:00:00.000Z\",\"start_time\":\"15:00:00\",\"end_time\":\"12:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":11}}', '2025-09-24 23:47:14'),
(12, 'appointment', 15, 'update', 'Test Administrator', '{\"old\":{\"appointment_id\":15,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-01T04:00:00.000Z\",\"start_time\":\"15:00:00\",\"end_time\":\"12:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":11},\"new\":{\"appointment_id\":15,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-03T04:00:00.000Z\",\"start_time\":\"14:30:00\",\"end_time\":\"12:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":11}}', '2025-09-24 23:49:26'),
(13, 'appointment', 15, 'delete', 'Test Administrator', '{\"old\":{\"appointment_id\":15,\"client_id\":1,\"service_id\":45,\"appointment_date\":\"2025-10-03T04:00:00.000Z\",\"start_time\":\"14:30:00\",\"end_time\":\"12:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":11},\"new\":null}', '2025-09-24 23:49:55'),
(14, 'appointment', 16, 'update', 'Test Administrator', '{\"old\":{\"appointment_id\":16,\"client_name\":\"Akshat Patel\",\"service_name\":\"Classic Pedicure\",\"staff_id\":null,\"appointment_date\":\"2025-09-27T04:00:00.000Z\",\"start_time\":\"15:30:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"pending\"},\"new\":{\"appointment_id\":16,\"client_name\":\"Akshat Patel\",\"service_name\":\"Classic Pedicure\",\"staff_id\":14,\"appointment_date\":\"2025-09-27T04:00:00.000Z\",\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"pending\"}}', '2025-09-25 12:32:43'),
(15, 'staff', 10, 'update', 'Unknown', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Jest\",\"last_name\":\"Odministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 12:57:46'),
(16, 'staff', 10, 'update', 'Unknown', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Jest\",\"last_name\":\"Odministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Lest\",\"last_name\":\"Edministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 13:10:26'),
(17, 'staff', 10, 'update', 'Unknown', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Lest\",\"last_name\":\"Edministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Fest\",\"last_name\":\"Odministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 13:27:49'),
(18, 'staff', 30, 'create', 'Test Administrator', '{\"old\":null,\"new\":{\"first_name\":\"Lest\",\"last_name\":\"Test\",\"email\":\"admin@exmple.com\",\"username\":\"lest\",\"role_id\":\"3\"}}', '2025-09-25 14:00:25'),
(19, 'staff', 30, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":30,\"email\":\"admin@exmple.com\",\"username\":\"lest\",\"hashed_password\":\"***hidden***\",\"role_id\":3,\"first_name\":\"Lest\",\"last_name\":\"Test\",\"phone_number\":\"6476406708\",\"address\":\"15 Heathrow Lane\",\"city\":\"Bolton\",\"province\":\"Ontario\",\"postal_code\":\"L7E2E1\"},\"new\":{\"staff_id\":30,\"email\":\"admin@exmple.com\",\"username\":\"lest\",\"hashed_password\":\"***hidden***\",\"role_id\":3,\"first_name\":\"Lest\",\"last_name\":\"Test\",\"phone_number\":\"6476406708\",\"address\":\"15 Heathrow Lane\",\"city\":\"Bolton\",\"province\":\"Ontario\",\"postal_code\":\"L7A2A6\"}}', '2025-09-25 14:01:29'),
(20, 'staff', 30, 'delete', 'Test Administrator', '{\"old\":{\"staff_id\":30,\"email\":\"admin@exmple.com\",\"username\":\"lest\",\"hashed_password\":\"***hidden***\",\"role_id\":3,\"first_name\":\"Lest\",\"last_name\":\"Test\",\"phone_number\":\"6476406708\",\"address\":\"15 Heathrow Lane\",\"city\":\"Bolton\",\"province\":\"Ontario\",\"postal_code\":\"L7A2A6\"},\"new\":null}', '2025-09-25 14:02:43'),
(21, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Fest\",\"last_name\":\"Odministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 14:26:56'),
(22, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Jdministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 14:37:05'),
(23, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Jdministrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 14:37:43'),
(24, 'client', 5, 'delete', 'Test Administrator', '{\"old\":{\"client_id\":5,\"first_name\":\"I dont know\",\"last_name\":\"why\",\"email\":\"pateltarangi6800@gmail.com\",\"phone_number\":\"1234567899\",\"address\":\"46 Leagate Street\",\"city\":\"Brampton\",\"postal_code\":\"L7A 2A6\"},\"new\":null}', '2025-09-25 14:38:20'),
(25, 'client', 8, 'create', 'Test Administrator', '{\"new\":{\"first_name\":\"Jeff\",\"last_name\":\"Bezos\",\"email\":\"jeffbezos@gmail.com\",\"phone_number\":\"1234567890\",\"address\":\"123 Know Street\",\"city\":\"Bolton\",\"postal_code\":\"L7E2E1\"}}', '2025-09-25 14:39:22'),
(26, 'service', 1, 'update', 'Test Administrator', '{\"old\":{\"service_id\":1,\"name\":\"Express Facial\",\"duration_minutes\":30,\"price\":\"85.00\",\"description\":\"A quick refreshing facial.\",\"category\":\"Facials & Skin Treatments\"},\"new\":{\"service_id\":\"1\",\"name\":\"Facial\",\"duration_minutes\":30,\"price\":\"85.00\",\"description\":\"A quick refreshing facial.\",\"category\":\"Facials & Skin Treatments\"}}', '2025-09-25 14:48:31'),
(27, 'service', 1, 'update', 'Test Administrator', '{\"old\":{\"service_id\":1,\"name\":\"Facial\",\"duration_minutes\":30,\"price\":\"85.00\",\"description\":\"A quick refreshing facial.\",\"category\":\"Facials & Skin Treatments\"},\"new\":{\"service_id\":\"1\",\"name\":\"Service Facial\",\"duration_minutes\":30,\"price\":\"85.00\",\"description\":\"A quick refreshing facial.\",\"category\":\"Facials & Skin Treatments\"}}', '2025-09-25 14:49:07'),
(28, 'service', 1, 'delete', 'Test Administrator', '{\"old\":{\"service_id\":1,\"name\":\"Service Facial\",\"duration_minutes\":30,\"price\":\"85.00\",\"description\":\"A quick refreshing facial.\",\"category\":\"Facials & Skin Treatments\"}}', '2025-09-25 14:49:54'),
(29, 'staff', 31, 'create', 'Test Administrator', '{\"old\":null,\"new\":{\"first_name\":\"Test\",\"last_name\":\"Lest\",\"email\":\"idk@example.com\",\"username\":\"test123\",\"role_id\":\"3\"}}', '2025-09-25 15:11:43'),
(30, 'staff', 32, 'create', 'Test Administrator', '{\"old\":null,\"new\":{\"first_name\":\"hey\",\"last_name\":\"patel\",\"email\":\"patel@example.com\",\"username\":\"patel\",\"role_id\":\"3\"}}', '2025-09-25 18:30:48'),
(31, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 18:32:58'),
(32, 'staff', 33, 'update', 'Test User', '{\"old\":{\"staff_id\":33,\"email\":\"testadmin@example.com\",\"username\":\"test\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"User\",\"phone_number\":null,\"address\":\"1234 Main St\",\"city\":\"Brampton\",\"province\":\"ON\",\"postal_code\":\"M1A1A1\"},\"new\":{\"staff_id\":33,\"email\":\"testadmin@example.com\",\"username\":\"test\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"User\",\"phone_number\":null,\"address\":\"1234 Main St\",\"city\":\"Brampton\",\"province\":\"ON\",\"postal_code\":\"M1A1A1\"}}', '2025-09-25 19:11:47'),
(33, 'staff', 10, 'update', 'Test User', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 19:18:54'),
(34, 'staff', 33, 'update', 'Test User', '{\"old\":{\"staff_id\":33,\"email\":\"testadmin@example.com\",\"username\":\"test\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"User\",\"phone_number\":null,\"address\":\"1234 Main St\",\"city\":\"Brampton\",\"province\":\"ON\",\"postal_code\":\"M1A1A1\"},\"new\":{\"staff_id\":33,\"email\":\"testadmin@example.com\",\"username\":\"test\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"User\",\"phone_number\":null,\"address\":\"1234 Main St\",\"city\":\"Brampton\",\"province\":\"ON\",\"postal_code\":\"M1A1A1\"}}', '2025-09-25 19:19:52'),
(35, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\"}}', '2025-09-25 19:55:33'),
(36, 'appointment', 16, 'confirm', 'Test Administrator', '{\"old\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"},\"new\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"}}', '2025-11-13 02:57:48'),
(37, 'staff', 10, 'update', 'Test Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Test\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0}}', '2025-11-13 03:25:04'),
(38, 'staff', 10, 'update', 'Love Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0}}', '2025-11-13 03:25:06'),
(39, 'service', 2, 'update', 'Love Administrator', '{\"old\":{\"service_id\":2,\"name\":\"Hydrating Facial\",\"duration_minutes\":20,\"price\":\"140.00\",\"description\":\"Replenishes moisture and hydrates skin.\",\"category\":\"Facials & Skin Treatments\"},\"new\":{\"service_id\":2,\"name\":\"Hydrating Facial\",\"duration_minutes\":20,\"price\":\"100.00\",\"description\":\"Replenishes moisture and hydrates skin.\",\"category\":\"Facials & Skin Treatments\"}}', '2025-11-13 03:35:11'),
(40, 'staff', 10, 'update', 'Love Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"i love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0}}', '2025-11-13 03:36:10'),
(41, 'staff', 10, 'update', 'i love Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"i love\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Admin\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0}}', '2025-11-13 03:36:18'),
(42, 'staff', 10, 'update', 'Admin Administrator', '{\"old\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Admin\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0},\"new\":{\"staff_id\":10,\"email\":\"admin@example.com\",\"username\":\"admin\",\"hashed_password\":\"***hidden***\",\"role_id\":1,\"first_name\":\"Admin\",\"last_name\":\"Administrator\",\"phone_number\":\"+1-363-621-1141\",\"address\":\"123 Main St\",\"city\":\"Toronto\",\"province\":\"ON\",\"postal_code\":\"T1A1A1\",\"online\":0}}', '2025-11-13 03:36:38'),
(43, 'appointment', 16, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"},\"new\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"}}', '2025-11-13 03:37:12'),
(44, 'appointment', 16, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"},\"new\":{\"appointment_id\":16,\"client_id\":1,\"service_id\":22,\"appointment_date\":{},\"start_time\":\"14:00:00\",\"end_time\":\"16:30:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":14,\"client_first_name\":\"Akshat\",\"client_email\":\"akshatpat3l@gmail.com\",\"service_name\":\"Classic Pedicure\"}}', '2025-11-13 03:37:29'),
(45, 'appointment', 17, 'reschedule', 'Admin Administrator', '{\"old\":{\"appointment_id\":17,\"client_id\":7,\"service_id\":21,\"appointment_date\":{},\"start_time\":\"12:00:00\",\"end_time\":\"13:00:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":null,\"client_first_name\":\"hi\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Gel Manicure\"},\"new\":{\"appointment_id\":17,\"client_id\":7,\"service_id\":21,\"appointment_date\":{},\"start_time\":\"12:00:00\",\"end_time\":\"13:00:00\",\"notes\":\"Staff member is unavailable at this time\",\"status\":\"rescheduled\",\"staff_id\":null,\"client_first_name\":\"hi\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Gel Manicure\"}}', '2025-11-13 03:51:35'),
(46, 'appointment', 17, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":17,\"client_id\":7,\"service_id\":21,\"appointment_date\":{},\"start_time\":\"12:00:00\",\"end_time\":\"13:00:00\",\"notes\":\"Staff member is unavailable at this time\",\"status\":\"rescheduled\",\"staff_id\":null,\"client_first_name\":\"hi\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Gel Manicure\"},\"new\":{\"appointment_id\":17,\"client_id\":7,\"service_id\":21,\"appointment_date\":{},\"start_time\":\"12:00:00\",\"end_time\":\"13:00:00\",\"notes\":\"Staff member is unavailable at this time\",\"status\":\"confirmed\",\"staff_id\":null,\"client_first_name\":\"hi\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Gel Manicure\"}}', '2025-11-13 03:52:38'),
(47, 'service', 60, 'create', 'Admin Administrator', '{\"new\":{\"name\":\"Feet Massage\",\"duration_minutes\":\"360\",\"price\":\"0\",\"category\":\"\",\"description\":\"\"}}', '2025-11-13 03:54:22'),
(48, 'service', 60, 'delete', 'Admin Administrator', '{\"old\":{\"service_id\":60,\"name\":\"Feet Massage\",\"duration_minutes\":360,\"price\":\"0.00\",\"description\":null,\"category\":null}}', '2025-11-13 03:55:06'),
(49, 'clock_in_out', 1, 'clock_in', 'Admin Administrator', '{\"new\":{\"staff_id\":10,\"clock_in_time\":{},\"notes\":null}}', '2025-11-13 04:56:50'),
(50, 'clock_in_out', 1, 'clock_out', 'Admin Administrator', '{\"old\":{\"clock_out_time\":null,\"duration_minutes\":null},\"new\":{\"clock_out_time\":{},\"duration_minutes\":4,\"notes\":null}}', '2025-11-13 05:01:08'),
(51, 'clock_in_out', 2, 'clock_in', 'Admin Administrator', '{\"new\":{\"staff_id\":10,\"clock_in_time\":{},\"notes\":null}}', '2025-11-14 06:20:05'),
(52, 'clock_in_out', 2, 'clock_out', 'Admin Administrator', '{\"old\":{\"clock_out_time\":null,\"duration_minutes\":null},\"new\":{\"clock_out_time\":{},\"duration_minutes\":0,\"notes\":null}}', '2025-11-14 06:20:07'),
(53, 'clock_in_out', 3, 'clock_in', 'Admin Administrator', '{\"new\":{\"staff_id\":10,\"clock_in_time\":{},\"notes\":null}}', '2025-11-14 06:31:16'),
(54, 'clock_in_out', 3, 'clock_out', 'Admin Administrator', '{\"old\":{\"clock_out_time\":null,\"duration_minutes\":null},\"new\":{\"clock_out_time\":{},\"duration_minutes\":0,\"notes\":null}}', '2025-11-14 06:31:18'),
(55, 'appointment', 19, 'delete', 'Admin Administrator', '{\"old\":{\"appointment_id\":19,\"client_id\":7,\"service_id\":20,\"appointment_date\":{},\"start_time\":\"00:00:00\",\"end_time\":\"01:00:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null}}', '2025-11-19 00:10:36'),
(56, 'appointment', 20, 'delete', 'Admin Administrator', '{\"old\":{\"appointment_id\":20,\"client_id\":7,\"service_id\":20,\"appointment_date\":{},\"start_time\":\"00:00:00\",\"end_time\":\"00:00:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null}}', '2025-11-19 00:10:38'),
(57, 'clock_in_out', 4, 'clock_in', 'Admin Administrator', '{\"new\":{\"staff_id\":10,\"clock_in_time\":{},\"notes\":null}}', '2025-11-19 00:11:26'),
(58, 'appointment', 18, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"pending\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"},\"new\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"}}', '2025-11-19 00:12:52'),
(59, 'appointment', 18, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"},\"new\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"}}', '2025-11-19 00:13:26'),
(60, 'appointment', 18, 'confirm', 'Admin Administrator', '{\"old\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"},\"new\":{\"appointment_id\":18,\"client_id\":7,\"service_id\":27,\"appointment_date\":{},\"start_time\":\"11:30:00\",\"end_time\":\"11:45:00\",\"notes\":\"\",\"status\":\"confirmed\",\"staff_id\":null,\"recurring_id\":null,\"is_recurring_instance\":0,\"buffer_time_minutes\":0,\"internal_notes\":null,\"source\":\"phone\",\"is_no_show\":0,\"no_show_reason\":null,\"client_first_name\":\"Bob\",\"client_email\":\"contactjaskaran@gmail.com\",\"service_name\":\"Paraffin Wax (Add-On)\"}}', '2025-11-19 00:14:17');

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `client_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`client_id`, `first_name`, `last_name`, `email`, `phone_number`, `address`, `city`, `postal_code`) VALUES
(1, 'Akshat', 'Patel', 'akshatpat3l@gmail.com', '4168406708', '15 Heathroow Lane', 'Bolton', 'L7E 2E1'),
(6, 'Sanjay', 'Patel', 'write@myself.com', '4168406708', '15 Heathrow Lane', 'Bolton', 'L7E 2E1'),
(7, 'Bob', 'TheBuilder', 'contactjaskaran@gmail.com', '6475409873', NULL, NULL, NULL),
(8, 'Jeff', 'Bezos', 'jeffbezos@gmail.com', '1234567890', '123 Know Street', 'Bolton', 'L7E2E1');

-- --------------------------------------------------------

--
-- Table structure for table `clock_in_out`
--

CREATE TABLE `clock_in_out` (
  `clock_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `clock_in_time` datetime NOT NULL,
  `clock_out_time` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clock_in_out`
--

INSERT INTO `clock_in_out` (`clock_id`, `staff_id`, `clock_in_time`, `clock_out_time`, `duration_minutes`, `notes`, `created_at`) VALUES
(1, 10, '2025-11-12 23:56:50', '2025-11-13 00:01:08', 4, NULL, '2025-11-13 04:56:50'),
(2, 10, '2025-11-14 01:20:05', '2025-11-14 01:20:07', 0, NULL, '2025-11-14 06:20:05'),
(3, 10, '2025-11-14 01:31:16', '2025-11-14 01:31:18', 0, NULL, '2025-11-14 06:31:16'),
(4, 10, '2025-11-18 19:11:26', NULL, NULL, NULL, '2025-11-19 00:11:26');

-- --------------------------------------------------------

--
-- Table structure for table `leave_balances`
--

CREATE TABLE `leave_balances` (
  `balance_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `year` year(4) NOT NULL,
  `total_allocated` decimal(5,2) DEFAULT 0.00,
  `used` decimal(5,2) DEFAULT 0.00,
  `remaining` decimal(5,2) GENERATED ALWAYS AS (`total_allocated` - `used`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_types`
--

CREATE TABLE `leave_types` (
  `leave_type_id` int(11) NOT NULL,
  `type_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `is_paid` tinyint(1) DEFAULT 0,
  `max_days_per_year` int(11) DEFAULT NULL,
  `requires_approval` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `leave_types`
--

INSERT INTO `leave_types` (`leave_type_id`, `type_name`, `description`, `is_paid`, `max_days_per_year`, `requires_approval`, `created_at`) VALUES
(1, 'Vacation', 'Paid vacation time', 1, 15, 1, '2025-11-13 05:16:16'),
(2, 'Sick Leave', 'Sick leave', 1, 10, 0, '2025-11-13 05:16:16'),
(3, 'Personal', 'Personal time off', 0, 5, 1, '2025-11-13 05:16:16'),
(4, 'Bereavement', 'Bereavement leave', 1, 5, 0, '2025-11-13 05:16:16'),
(5, 'Maternity/Paternity', 'Maternity or paternity leave', 1, 90, 1, '2025-11-13 05:16:16');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL COMMENT 'Staff ID',
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `related_entity_type` varchar(50) DEFAULT NULL COMMENT 'appointment, time_off, etc.',
  `related_entity_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `sent_via` enum('email','sms','in_app','push') DEFAULT 'in_app',
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_preferences`
--

CREATE TABLE `notification_preferences` (
  `preference_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL COMMENT 'NULL means system-wide default',
  `notification_type` varchar(50) NOT NULL,
  `email_enabled` tinyint(1) DEFAULT 1,
  `sms_enabled` tinyint(1) DEFAULT 0,
  `in_app_enabled` tinyint(1) DEFAULT 1,
  `reminder_minutes_before` int(11) DEFAULT NULL COMMENT 'For appointment reminders',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_preferences`
--

INSERT INTO `notification_preferences` (`preference_id`, `staff_id`, `notification_type`, `email_enabled`, `sms_enabled`, `in_app_enabled`, `reminder_minutes_before`, `created_at`, `updated_at`) VALUES
(1, NULL, 'appointment_reminder', 1, 0, 1, 1440, '2025-11-13 05:16:16', '2025-11-13 05:16:16'),
(2, NULL, 'appointment_reminder', 1, 0, 1, 120, '2025-11-13 05:16:16', '2025-11-13 05:16:16'),
(3, NULL, 'time_off_approved', 1, 0, 1, NULL, '2025-11-13 05:16:16', '2025-11-13 05:16:16'),
(4, NULL, 'time_off_rejected', 1, 0, 1, NULL, '2025-11-13 05:16:16', '2025-11-13 05:16:16'),
(5, NULL, 'shift_swap', 0, 0, 1, NULL, '2025-11-13 05:16:16', '2025-11-13 05:16:16'),
(6, NULL, 'new_appointment', 1, 0, 1, NULL, '2025-11-13 05:16:16', '2025-11-13 05:16:16');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `permission_id` int(11) NOT NULL,
  `permission_name` varchar(100) NOT NULL,
  `permission_description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`permission_id`, `permission_name`, `permission_description`) VALUES
(1, 'staff_create', 'Permission to create new staff members.'),
(2, 'staff_read_all', 'Permission to view all staff members.'),
(3, 'staff_read_single', 'Permission to view a specific staff member.'),
(4, 'staff_update', 'Permission to update staff member information.'),
(5, 'staff_delete', 'Permission to delete staff members.'),
(6, 'appointment_confirm_deny', 'Permission to confirm or deny client appointments.'),
(7, 'appointment_read_all', 'Permission to view all appointments.'),
(8, 'appointment_read_client', 'Permission to view appointments for a specific client.'),
(9, 'appointment_update', 'Permission to update appointment details (e.g., time, service).'),
(10, 'appointment_delete', 'Permission to delete appointments.'),
(11, 'user_create', 'Permission to create new user accounts.'),
(12, 'user_read_all', 'Permission to view all user accounts.'),
(13, 'user_read_single', 'Permission to view a specific user account (e.g., for self-management).'),
(14, 'user_update', 'Permission to update a user account (e.g., change password, email).'),
(15, 'user_delete', 'Permission to delete user accounts.'),
(16, 'client_create', 'Permission to create new client records.'),
(17, 'client_read_all', 'Permission to view all client records.'),
(18, 'client_read_single', 'Permission to view a specific client record.'),
(19, 'client_update', 'Permission to update a client\'s information.'),
(20, 'client_delete', 'Permission to delete a client record.'),
(21, 'service_create', 'Permission to add new services.'),
(22, 'service_read_all', 'Permission to view all services.'),
(23, 'service_read_single', 'Permission to view a specific service.'),
(24, 'service_update', 'Permission to update service details.'),
(25, 'service_delete', 'Permission to delete a service.'),
(26, 'role_create', 'Permission to create new roles.'),
(27, 'role_read_all', 'Permission to view all available roles.'),
(28, 'role_read_single', 'Permission to view a specific role and its permissions.'),
(29, 'role_update', 'Permission to update an existing role and its permissions.'),
(30, 'role_delete', 'Permission to delete roles.'),
(31, 'dashboard_view_admin', 'Permission to access the admin dashboard.'),
(32, 'reports_view', 'Permission to view reports and analytics.'),
(33, 'appointment_read_single', 'Permission to view a specific appointment'),
(34, 'timeslots_create', 'Permission to create new timeslots.'),
(35, 'timeslots_read_all', 'Permission to view all timeslots.'),
(36, 'timeslots_read_single', 'Permission to view a specific timeslot.'),
(37, 'timeslots_update', 'Permission to update timeslot information.'),
(38, 'timeslots_delete', 'Permission to delete timeslots.'),
(39, 'permission_read_all', 'Permission to view all permissions.'),
(40, 'permission_create', 'Permission to create new permissions.'),
(41, 'permission_delete', 'Permission to delete permissions.'),
(45, 'test', 'This is a test permission.'),
(46, 'verify_password', 'Permission to verify a staff member\'s current password before allowing password changes.'),
(47, 'logs_read_all', 'Permission to view all system logs.'),
(48, 'history_read_all', 'Permission to view all appointment history records'),
(49, 'see_appointments', 'Permission to view the Appointments tab in the dashboard.'),
(50, 'see_clients', 'Permission to view the Clients tab in the dashboard.'),
(51, 'see_staff', 'Permission to view the Staff tab in the dashboard.'),
(52, 'see_services', 'Permission to view the Services tab in the dashboard.'),
(53, 'see_roles', 'Permission to view the Roles tab in the dashboard.'),
(54, 'see_logs', 'Permission to view the Logs tab in the dashboard.'),
(55, 'see_history', 'Permission to view the Previous Appointments (History) tab in the dashboard.');

-- --------------------------------------------------------

--
-- Table structure for table `recurring_appointments`
--

CREATE TABLE `recurring_appointments` (
  `recurring_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `staff_id` int(11) DEFAULT NULL,
  `recurrence_pattern` enum('daily','weekly','biweekly','monthly') NOT NULL,
  `recurrence_day` tinyint(4) DEFAULT NULL COMMENT 'Day of week (0-6) or day of month (1-31)',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL COMMENT 'NULL means no end date',
  `max_occurrences` int(11) DEFAULT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rolepermissions`
--

CREATE TABLE `rolepermissions` (
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rolepermissions`
--

INSERT INTO `rolepermissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(1, 29),
(1, 30),
(1, 31),
(1, 32),
(1, 33),
(1, 34),
(1, 35),
(1, 36),
(1, 37),
(1, 38),
(1, 39),
(1, 40),
(1, 41),
(1, 46),
(1, 47),
(1, 48),
(1, 49),
(1, 50),
(1, 51),
(1, 52),
(1, 53),
(1, 54),
(1, 55),
(3, 2),
(3, 3),
(3, 6),
(3, 7),
(3, 9),
(3, 17),
(3, 18),
(3, 22),
(3, 23),
(3, 24),
(3, 33),
(3, 49),
(3, 50),
(3, 52),
(3, 55);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `role_description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `role_description`) VALUES
(1, 'Admin', 'Administrator with full system access.'),
(2, 'Staff', 'Handles appointments, customer service, and day-to-day operations'),
(3, 'Manager', 'Manages staff, schedules, and oversees salon performance');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `name`, `duration_minutes`, `price`, `description`, `category`) VALUES
(2, 'Hydrating Facial', 20, 100.00, 'Replenishes moisture and hydrates skin.', 'Facials & Skin Treatments'),
(3, 'Deep Cleansing Facial', 60, 160.00, 'Thoroughly cleanses pores and removes impurities.', 'Facials & Skin Treatments'),
(4, 'Signature Glow Facial + Steam', 75, 180.00, 'Includes a steam treatment for radiant skin.', 'Facials & Skin Treatments'),
(5, 'Micro needling', 90, 220.00, 'A procedure to rejuvenate and improve skin texture.', 'Facials & Skin Treatments'),
(6, 'Chemical Peel', 60, 165.00, 'Exfoliates to reveal smoother, brighter skin.', 'Facials & Skin Treatments'),
(8, 'Back Facial', 60, 150.00, 'A cleansing and clarifying treatment for the back.', 'Facials & Skin Treatments'),
(9, 'LED Therapy (Add-On)', 20, 40.00, 'An add-on to enhance your facial treatment.', 'Facials & Skin Treatments'),
(10, 'Teen Facial', 45, 95.00, 'Designed for the specific needs of teenage skin.', 'Facials & Skin Treatments'),
(11, 'Sensitive Skin Facial', 60, 145.00, 'Gentle facial for sensitive and easily irritated skin.', 'Facials & Skin Treatments'),
(12, 'Relaxation Massage', 60, 110.00, 'A gentle massage to soothe and relax the body.', 'Massage Therapy'),
(13, 'Deep Tissue Massage', 60, 130.00, 'Targets deeper layers of muscle to release tension.', 'Massage Therapy'),
(14, 'Aromatherapy Massage', 60, 135.00, 'Uses essential oils to enhance relaxation.', 'Massage Therapy'),
(15, 'Hot Stone Massage', 75, 140.00, 'Uses heated stones to relax muscles and ease tension.', 'Massage Therapy'),
(16, 'Prenatal Massage', 60, 130.00, 'Safe and relaxing massage for expectant mothers.', 'Massage Therapy'),
(17, 'Head, Neck & Shoulder', 30, 85.00, 'Focuses on the upper body for targeted relief.', 'Massage Therapy'),
(18, 'Customized Full Body', 90, 145.00, 'Tailored to your specific needs and areas of tension.', 'Massage Therapy'),
(19, 'Classic Manicure', 45, 40.00, 'Basic nail care, shaping, and polish application.', 'Nail Services'),
(20, 'Shellac Manicure', 60, 55.00, 'Long-lasting gel polish manicure.', 'Nail Services'),
(21, 'Gel Manicure', 60, 65.00, 'Durable gel nail polish application.', 'Nail Services'),
(22, 'Classic Pedicure', 60, 55.00, 'Standard pedicure with foot care and polish.', 'Nail Services'),
(23, 'Spa Pedicure', 75, 75.00, 'An extended pedicure with extra pampering.', 'Nail Services'),
(24, 'Gel Extensions', 90, 85.00, 'Adds length and strength with gel extensions.', 'Nail Services'),
(25, 'Custom Nail Art', 60, 95.00, 'Creative and custom designs on your nails.', 'Nail Services'),
(26, 'Add-On: French Tips', 15, 5.00, 'Add-on for a classic French tips look.', 'Nail Services'),
(27, 'Paraffin Wax (Add-On)', 15, 20.00, 'An add-on to soften and moisturize hands or feet.', 'Nail Services'),
(28, 'Kids Mani/Pedi', 30, 35.00, 'A fun and simple manicure and pedicure for kids.', 'Nail Services'),
(29, 'Event Makeup', 60, 120.00, 'Makeup application for special events.', 'Makeup Services'),
(30, 'Soft Glam', 75, 150.00, 'A subtle yet glamorous makeup look.', 'Makeup Services'),
(31, 'Full Glam', 90, 160.00, 'A complete, dramatic makeup application.', 'Makeup Services'),
(32, 'Bridal Makeup', 120, 250.00, 'Specialized makeup for the bride on her big day.', 'Makeup Services'),
(33, 'Nikkah / Engagement', 90, 180.00, 'Makeup for Nikkah or engagement ceremonies.', 'Makeup Services'),
(34, 'Prom / Photoshoot', 90, 130.00, 'Makeup specifically for prom or professional photoshoots.', 'Makeup Services'),
(35, 'Airbrush Makeup', 90, 190.00, 'Long-lasting, flawless airbrush foundation application.', 'Makeup Services'),
(36, 'Touch-Up (Add-On)', 15, 50.00, 'A quick touch-up service for makeup.', 'Makeup Services'),
(37, 'Eyebrow Threading/Waxing', 15, 22.00, 'Shaping eyebrows using threading or waxing.', 'Waxing & Hair Removal'),
(38, 'Upper Lip / Chin', 10, 18.00, 'Quick waxing of the upper lip or chin.', 'Waxing & Hair Removal'),
(39, 'Full Face', 30, 55.00, 'Waxing for the entire face.', 'Waxing & Hair Removal'),
(40, 'Underarms', 15, 30.00, 'Waxing for the underarm area.', 'Waxing & Hair Removal'),
(41, 'Full Arms', 30, 65.00, 'Waxing for the full length of both arms.', 'Waxing & Hair Removal'),
(42, 'Half Legs', 30, 55.00, 'Waxing for the lower or upper half of the legs.', 'Waxing & Hair Removal'),
(43, 'Full Legs', 60, 90.00, 'Waxing for the full length of both legs.', 'Waxing & Hair Removal'),
(44, 'Bikini Line', 20, 65.00, 'Waxing along the bikini line.', 'Waxing & Hair Removal'),
(45, 'Brazilian Wax', 30, 70.00, 'Complete hair removal from the pubic area.', 'Waxing & Hair Removal'),
(46, 'Full Body', 120, 170.00, 'Waxing for the entire body.', 'Waxing & Hair Removal'),
(47, 'Blowdry (Basic)', 45, 65.00, 'Professional hair blowdry for a sleek finish.', 'Hairstyling'),
(48, 'Curls / Waves', 60, 70.00, 'Styling with curls or waves.', 'Hairstyling'),
(49, 'Event Updo', 90, 120.00, 'An elegant updo for special events.', 'Hairstyling'),
(50, 'Bridal Styling', 120, 220.00, 'Custom hair styling for a bride.', 'Hairstyling'),
(51, 'Oil Massage + Blowdry', 60, 85.00, 'A relaxing head massage followed by a blowdry.', 'Hairstyling'),
(52, 'Hair Extensions Install', 120, 95.00, 'Professional installation of hair extensions.', 'Hairstyling'),
(53, 'Braiding / Styling', 60, 55.00, 'Various braiding and styling services.', 'Hairstyling'),
(54, 'Glam Photoshoot', 60, 75.00, 'A professional photoshoot add-on with a glamorous style.', 'Photography Studio Add-On'),
(55, 'Bridal Session', 90, 110.00, 'A photography session for a bride.', 'Photography Studio Add-On'),
(56, 'Instagram Shoot', 45, 85.00, 'A quick, stylized photoshoot perfect for social media.', 'Photography Studio Add-On'),
(57, 'Before & After', 30, 60.00, 'A photo session capturing the transformation.', 'Photography Studio Add-On');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('Tyk0p7xrttH5MVMo3Wd7IyuPtMnZNn7r', 1764116673, '{\"cookie\":{\"originalMaxAge\":604800000,\"expires\":\"2025-11-20T08:12:59.281Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\",\"sameSite\":\"lax\"},\"user\":{\"id\":10,\"username\":\"admin\",\"email\":\"admin@example.com\",\"first_name\":\"Admin\",\"last_name\":\"Administrator\",\"role_id\":1,\"permissions\":[\"staff_create\",\"staff_read_all\",\"staff_read_single\",\"staff_update\",\"staff_delete\",\"appointment_confirm_deny\",\"appointment_read_all\",\"appointment_read_client\",\"appointment_update\",\"appointment_delete\",\"user_create\",\"user_read_all\",\"user_read_single\",\"user_update\",\"user_delete\",\"client_create\",\"client_read_all\",\"client_read_single\",\"client_update\",\"client_delete\",\"service_create\",\"service_read_all\",\"service_read_single\",\"service_update\",\"service_delete\",\"role_create\",\"role_read_all\",\"role_read_single\",\"role_update\",\"role_delete\",\"dashboard_view_admin\",\"reports_view\",\"appointment_read_single\",\"timeslots_create\",\"timeslots_read_all\",\"timeslots_read_single\",\"timeslots_update\",\"timeslots_delete\",\"permission_read_all\",\"permission_create\",\"permission_delete\",\"verify_password\",\"logs_read_all\",\"history_read_all\",\"see_appointments\",\"see_clients\",\"see_staff\",\"see_services\",\"see_roles\",\"see_logs\",\"see_history\"]},\"createdAt\":1763021579281}');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `online` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `email`, `username`, `hashed_password`, `role_id`, `first_name`, `last_name`, `phone_number`, `address`, `city`, `province`, `postal_code`, `online`) VALUES
(10, 'admin@example.com', 'admin', '$2b$10$y4Paabr4q1wIovXNmy1P1eD/H/4B2qvHiWMaBDeVRW0KT2dUOtzDi', 1, 'Admin', 'Administrator', '+1-363-621-1141', '123 Main St', 'Toronto', 'ON', 'T1A1A1', 1),
(11, 'jane.doe@example.com', 'jane', '$2a$10$f4x10oOihcZAenzA1.2q.uqaDi4GaaEbiKHIFeiRLOUt2G3Jn7ZX.', 2, 'Jane', 'Doe', '+1-407-696-3584', '456 Elm St', 'Vancouver', 'BC', 'V5K0A1', 0),
(12, 'john.smith@example.com', 'john', '$2a$10$/rbDWz4De4sIT3nLO8HECO6xQFycu1ukut0..FA1HGdqrB9G93b/m', 2, 'John', 'Smith', '+1-503-439-5907', '789 Oak St', 'Calgary', 'AB', 'T2A2B2', 0),
(14, 'jeff.bezos@example.com', 'jeffbezos', '$2b$10$cv80DI5Y41WvFXK0rKumoePriRn1XZHGF2cvbk1AIKgk/CzmXyuW6', 2, 'jeff', 'bezos', '1112223333', '46 Leagate Street', 'Bolton', 'Ontario', 'L7E 2E1', 0),
(31, 'idk@example.com', 'test123', '$2b$10$nTQe7zj9Nba4XCTofgZatO2eBKQGYdYSmPYo3TaOxohSJV8JHkjLS', 3, 'Test', 'Lest', '1234567890', '15 Heathrow Lane', 'Bolton', 'Ontario', 'L7E 2E1', 0),
(32, 'patel@example.com', 'patel', '$2b$10$f6TvZPU4NgnKfv0bVZjyruBwor/tAhkra3W7UE3SAGb8ZhxHPHdXC', 3, 'hey', 'patel', '1234567890', '123 Main St', 'Bolton', 'Ontario', 'L7E2E1', 0),
(33, 'testadmin@example.com', 'test', '$2b$10$nWdd2KbSGUjGBGd9Vol.AOmRA9uagpLBtc1i64fM.8IvooVJpni.K', 1, 'Test', 'User', NULL, '1234 Main St', 'Brampton', 'ON', 'M1A1A1', 0);

-- --------------------------------------------------------

--
-- Table structure for table `staff_availability_overrides`
--

CREATE TABLE `staff_availability_overrides` (
  `override_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `override_date` date NOT NULL,
  `start_time` time DEFAULT NULL COMMENT 'NULL means unavailable all day',
  `end_time` time DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_schedules`
--

CREATE TABLE `staff_schedules` (
  `schedule_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `day_of_week` tinyint(4) NOT NULL COMMENT '0=Sunday, 1=Monday, ..., 6=Saturday',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `break_start_time` time DEFAULT NULL,
  `break_end_time` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_skills`
--

CREATE TABLE `staff_skills` (
  `staff_skill_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `proficiency_level` enum('beginner','intermediate','advanced','expert') DEFAULT 'intermediate',
  `years_experience` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `time_off_requests`
--

CREATE TABLE `time_off_requests` (
  `request_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` decimal(5,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `requested_by` int(11) DEFAULT NULL COMMENT 'Staff who requested (for managers requesting for others)',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `training_records`
--

CREATE TABLE `training_records` (
  `training_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `training_name` varchar(200) NOT NULL,
  `training_type` varchar(50) DEFAULT NULL,
  `provider` varchar(200) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `completion_date` date DEFAULT NULL,
  `status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
  `certificate_url` varchar(500) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `waitlist`
--

CREATE TABLE `waitlist` (
  `waitlist_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `preferred_staff_id` int(11) DEFAULT NULL,
  `preferred_date` date DEFAULT NULL,
  `preferred_time` time DEFAULT NULL,
  `priority` int(11) DEFAULT 0 COMMENT 'Higher number = higher priority',
  `status` enum('active','notified','converted','cancelled') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `notified_at` timestamp NULL DEFAULT NULL,
  `converted_to_appointment_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointmenthistory`
--
ALTER TABLE `appointmenthistory`
  ADD PRIMARY KEY (`history_id`),
  ADD UNIQUE KEY `uniq_appointment` (`appointment_id`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `fk_staff_appointment` (`staff_id`),
  ADD KEY `idx_recurring` (`recurring_id`),
  ADD KEY `idx_appointments_staff_date` (`staff_id`,`appointment_date`,`start_time`),
  ADD KEY `idx_appointments_status_date` (`status`,`appointment_date`),
  ADD KEY `idx_appointments_client` (`client_id`);

--
-- Indexes for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD PRIMARY KEY (`reminder_id`),
  ADD KEY `idx_scheduled` (`scheduled_for`,`status`),
  ADD KEY `idx_appointment` (`appointment_id`);

--
-- Indexes for table `certifications`
--
ALTER TABLE `certifications`
  ADD PRIMARY KEY (`certification_id`),
  ADD KEY `idx_staff_active` (`staff_id`,`is_active`),
  ADD KEY `idx_expiry` (`expiry_date`);

--
-- Indexes for table `changelogs`
--
ALTER TABLE `changelogs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`client_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `clock_in_out`
--
ALTER TABLE `clock_in_out`
  ADD PRIMARY KEY (`clock_id`),
  ADD KEY `idx_staff_id` (`staff_id`),
  ADD KEY `idx_clock_in_time` (`clock_in_time`),
  ADD KEY `idx_clock_out_time` (`clock_out_time`),
  ADD KEY `idx_clock_staff_date` (`staff_id`,`clock_in_time`);

--
-- Indexes for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD PRIMARY KEY (`balance_id`),
  ADD UNIQUE KEY `unique_staff_leave_year` (`staff_id`,`leave_type_id`,`year`),
  ADD KEY `leave_type_id` (`leave_type_id`);

--
-- Indexes for table `leave_types`
--
ALTER TABLE `leave_types`
  ADD PRIMARY KEY (`leave_type_id`),
  ADD UNIQUE KEY `type_name` (`type_name`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_recipient_unread` (`recipient_id`,`is_read`),
  ADD KEY `idx_created` (`sent_at`);

--
-- Indexes for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD PRIMARY KEY (`preference_id`),
  ADD UNIQUE KEY `unique_staff_type` (`staff_id`,`notification_type`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `permission_name` (`permission_name`);

--
-- Indexes for table `recurring_appointments`
--
ALTER TABLE `recurring_appointments`
  ADD PRIMARY KEY (`recurring_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `staff_id` (`staff_id`),
  ADD KEY `idx_active` (`is_active`,`start_date`);

--
-- Indexes for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`skill_id`),
  ADD UNIQUE KEY `skill_name` (`skill_name`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_staff_role` (`role_id`);

--
-- Indexes for table `staff_availability_overrides`
--
ALTER TABLE `staff_availability_overrides`
  ADD PRIMARY KEY (`override_id`),
  ADD UNIQUE KEY `unique_staff_date` (`staff_id`,`override_date`),
  ADD KEY `idx_staff_date` (`staff_id`,`override_date`);

--
-- Indexes for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `unique_staff_day` (`staff_id`,`day_of_week`),
  ADD KEY `idx_staff_day` (`staff_id`,`day_of_week`);

--
-- Indexes for table `staff_skills`
--
ALTER TABLE `staff_skills`
  ADD PRIMARY KEY (`staff_skill_id`),
  ADD UNIQUE KEY `unique_staff_skill` (`staff_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`),
  ADD KEY `verified_by` (`verified_by`);

--
-- Indexes for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `leave_type_id` (`leave_type_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_staff_status` (`staff_id`,`status`),
  ADD KEY `idx_date_range` (`start_date`,`end_date`);

--
-- Indexes for table `training_records`
--
ALTER TABLE `training_records`
  ADD PRIMARY KEY (`training_id`),
  ADD KEY `idx_staff_status` (`staff_id`,`status`);

--
-- Indexes for table `waitlist`
--
ALTER TABLE `waitlist`
  ADD PRIMARY KEY (`waitlist_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `preferred_staff_id` (`preferred_staff_id`),
  ADD KEY `converted_to_appointment_id` (`converted_to_appointment_id`),
  ADD KEY `idx_status` (`status`,`priority`),
  ADD KEY `idx_service_date` (`service_id`,`preferred_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointmenthistory`
--
ALTER TABLE `appointmenthistory`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  MODIFY `reminder_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certifications`
--
ALTER TABLE `certifications`
  MODIFY `certification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `changelogs`
--
ALTER TABLE `changelogs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `client_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `clock_in_out`
--
ALTER TABLE `clock_in_out`
  MODIFY `clock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `leave_balances`
--
ALTER TABLE `leave_balances`
  MODIFY `balance_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_types`
--
ALTER TABLE `leave_types`
  MODIFY `leave_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  MODIFY `preference_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `recurring_appointments`
--
ALTER TABLE `recurring_appointments`
  MODIFY `recurring_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `skill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `staff_availability_overrides`
--
ALTER TABLE `staff_availability_overrides`
  MODIFY `override_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_skills`
--
ALTER TABLE `staff_skills`
  MODIFY `staff_skill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_records`
--
ALTER TABLE `training_records`
  MODIFY `training_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `waitlist`
--
ALTER TABLE `waitlist`
  MODIFY `waitlist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`),
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`),
  ADD CONSTRAINT `fk_staff_appointment` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`);

--
-- Constraints for table `appointment_reminders`
--
ALTER TABLE `appointment_reminders`
  ADD CONSTRAINT `appointment_reminders_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE CASCADE;

--
-- Constraints for table `certifications`
--
ALTER TABLE `certifications`
  ADD CONSTRAINT `certifications_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `clock_in_out`
--
ALTER TABLE `clock_in_out`
  ADD CONSTRAINT `clock_in_out_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `leave_balances`
--
ALTER TABLE `leave_balances`
  ADD CONSTRAINT `leave_balances_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `leave_balances_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`recipient_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `recurring_appointments`
--
ALTER TABLE `recurring_appointments`
  ADD CONSTRAINT `recurring_appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recurring_appointments_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recurring_appointments_ibfk_3` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL;

--
-- Constraints for table `rolepermissions`
--
ALTER TABLE `rolepermissions`
  ADD CONSTRAINT `rolepermissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rolepermissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `fk_staff_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `staff_availability_overrides`
--
ALTER TABLE `staff_availability_overrides`
  ADD CONSTRAINT `staff_availability_overrides_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_schedules`
--
ALTER TABLE `staff_schedules`
  ADD CONSTRAINT `staff_schedules_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_skills`
--
ALTER TABLE `staff_skills`
  ADD CONSTRAINT `staff_skills_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`skill_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `staff_skills_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL;

--
-- Constraints for table `time_off_requests`
--
ALTER TABLE `time_off_requests`
  ADD CONSTRAINT `time_off_requests_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `time_off_requests_ibfk_2` FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`),
  ADD CONSTRAINT `time_off_requests_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL;

--
-- Constraints for table `training_records`
--
ALTER TABLE `training_records`
  ADD CONSTRAINT `training_records_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE;

--
-- Constraints for table `waitlist`
--
ALTER TABLE `waitlist`
  ADD CONSTRAINT `waitlist_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `waitlist_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `waitlist_ibfk_3` FOREIGN KEY (`preferred_staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `waitlist_ibfk_4` FOREIGN KEY (`converted_to_appointment_id`) REFERENCES `appointments` (`appointment_id`) ON DELETE SET NULL;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

