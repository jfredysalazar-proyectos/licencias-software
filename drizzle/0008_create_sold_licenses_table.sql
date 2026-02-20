-- Create sold_licenses table for tracking sold software licenses
CREATE TABLE IF NOT EXISTS `sold_licenses` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `customerName` varchar(200) NOT NULL,
  `customerEmail` varchar(320) NOT NULL,
  `customerWhatsapp` varchar(50) NOT NULL,
  `productId` int NOT NULL,
  `productName` varchar(200) NOT NULL,
  `licenseCode` varchar(500) NOT NULL,
  `expirationDate` date NOT NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
