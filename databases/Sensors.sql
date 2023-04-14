-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 07, 2023 at 06:44 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sensors`
--

-- --------------------------------------------------------

--
-- Table structure for table `schedule`
--

CREATE TABLE `schedule` (
  `id` int(11) NOT NULL,
  `actuators` varchar(255) NOT NULL,
  `time_on` varchar(255) DEFAULT NULL,
  `time_off` varchar(255) DEFAULT NULL,
  `monday` tinyint(1) NOT NULL,
  `tuesday` tinyint(1) NOT NULL,
  `wednesday` tinyint(1) NOT NULL,
  `thursday` tinyint(1) NOT NULL,
  `friday` tinyint(1) NOT NULL,
  `saturday` tinyint(1) NOT NULL,
  `sunday` tinyint(1) NOT NULL,
  `everyday` tinyint(1) NOT NULL,
  `displaytext` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `schedule`
--

INSERT INTO `schedule` (`id`, `actuators`, `time_on`, `time_off`, `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday`, `everyday`, `displaytext`, `status`) VALUES
(1, 'Grow Light', '06:00', '20:00', 1, 1, 1, 1, 1, 1, 1, 0, NULL, NULL),
(2, 'Water Pump', '', '', 0, 0, 0, 0, 0, 0, 0, 0, '', 0),
(3, 'Mist', '', '', 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL),
(4, 'fan', '', '', 0, 0, 0, 0, 0, 0, 0, 0, NULL, NULL),
(5, 'Aerator', '', '', 1, 1, 1, 1, 1, 1, 1, 0, 'ON/OFF Interval was set Every 30 mins', 1);

-- --------------------------------------------------------

--
-- Table structure for table `sensorreadings1`
--

CREATE TABLE `sensorreadings1` (
  `id` int(8) NOT NULL,
  `Water_Temperature` float NOT NULL,
  `Ph_Value` float NOT NULL,
  `Ec_Value` float NOT NULL,
  `DATE` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sensorreadings1`
--

INSERT INTO `sensorreadings1` (`id`, `Water_Temperature`, `Ph_Value`, `Ec_Value`, `DATE`) VALUES
(1, 12, 12, 12, '2023-03-31 09:00:11'),
(2, 12, 32, 12, '2023-03-30 08:57:04'),
(3, 11, 25, 12, '2023-03-28 08:57:53'),
(4, 56, 12, 43, '2023-03-27 08:58:45'),
(5, 45, 23, 34, '2023-03-29 09:40:08'),
(6, 56, 76, 89, '2023-03-26 09:42:43'),
(7, 12, 56, 12, '2023-04-01 10:06:10'),
(8, 6, 6, 34, '2023-04-02 11:44:04'),
(9, 3, 12, 13, '2023-04-03 07:33:04'),
(10, 12, 55, 24, '2023-04-04 07:33:04'),
(11, 67, 24, 43, '2023-04-05 07:34:03'),
(12, 23, 15, 12, '2023-04-03 07:35:02'),
(13, 56, 25, 41, '2023-04-04 07:35:02'),
(14, 85, 25, 24, '2023-04-05 07:35:43'),
(15, 47, 35, 23, '2023-04-06 07:37:28'),
(16, 20, 6, 0, '2023-04-07 03:54:53'),
(17, 80, 6, 5, '2023-04-07 04:23:12');

-- --------------------------------------------------------

--
-- Table structure for table `sensorreadings2`
--

CREATE TABLE `sensorreadings2` (
  `id` int(8) NOT NULL,
  `Humidity` float NOT NULL,
  `Room_Temp` float NOT NULL,
  `DATE` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `sensorreadings2`
--

INSERT INTO `sensorreadings2` (`id`, `Humidity`, `Room_Temp`, `DATE`) VALUES
(1, 23, 78, '2023-03-26 10:11:24'),
(2, 42, 14, '2023-03-27 10:11:24'),
(3, 68, 49, '2023-03-28 10:11:50'),
(4, 59, 79, '2023-03-29 10:11:59'),
(5, 37, 48, '2023-03-30 10:12:16'),
(6, 28, 25, '2023-03-31 10:12:29'),
(7, 57, 89, '2023-04-01 10:13:22'),
(9, 26, 34, '2023-04-02 11:43:26'),
(10, 13, 11, '2023-04-03 07:36:52'),
(11, 63, 53, '2023-04-04 07:36:52'),
(12, 21, 24, '2023-04-05 07:37:28'),
(13, 47, 35, '2023-04-06 07:37:28'),
(14, 87, 25, '2023-04-07 07:37:28'),
(31, 78, 21, '2023-04-07 04:08:21'),
(32, 78, 19, '2023-04-07 04:11:00'),
(33, 85, 19, '2023-04-07 04:12:28');

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `id` int(255) NOT NULL,
  `fan_status` varchar(255) NOT NULL,
  `light_status` varchar(255) NOT NULL,
  `pump_status` varchar(255) NOT NULL,
  `mist_status` varchar(255) NOT NULL,
  `aerator_status` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `status`
--

INSERT INTO `status` (`id`, `fan_status`, `light_status`, `pump_status`, `mist_status`, `aerator_status`) VALUES
(1, 'OFF', 'OFF', 'OFF', 'OFF', 'ON');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `schedule`
--
ALTER TABLE `schedule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sensorreadings1`
--
ALTER TABLE `sensorreadings1`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sensorreadings2`
--
ALTER TABLE `sensorreadings2`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `schedule`
--
ALTER TABLE `schedule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `sensorreadings1`
--
ALTER TABLE `sensorreadings1`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sensorreadings2`
--
ALTER TABLE `sensorreadings2`
  MODIFY `id` int(8) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `status`
--
ALTER TABLE `status`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
