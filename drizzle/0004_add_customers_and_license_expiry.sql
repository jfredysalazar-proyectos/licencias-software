-- Create customers table for end-user authentication
CREATE TABLE IF NOT EXISTS `customers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(320) NOT NULL UNIQUE,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(200),
  `phone` varchar(50),
  `active` int NOT NULL DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastLogin` timestamp
);

-- Add customerId and expiresAt to orders table
ALTER TABLE `orders` ADD COLUMN `customerId` int;
ALTER TABLE `orders` ADD COLUMN `expiresAt` timestamp;
