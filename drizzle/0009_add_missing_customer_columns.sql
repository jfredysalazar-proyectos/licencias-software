-- Add missing columns to customers table if they don't exist
-- This migration handles the case where the table was already created without role and balance columns

ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `role` enum('customer', 'reseller') NOT NULL DEFAULT 'customer' AFTER `active`;
ALTER TABLE `customers` ADD COLUMN IF NOT EXISTS `balance` int NOT NULL DEFAULT 0 AFTER `role`;
