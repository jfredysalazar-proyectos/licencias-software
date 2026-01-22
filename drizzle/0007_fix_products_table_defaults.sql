-- Fix products table to remove DEFAULT constraints that conflict with Drizzle ORM
-- This migration modifies the table structure to match the Drizzle schema

ALTER TABLE `products` MODIFY COLUMN `featured` int NOT NULL;
ALTER TABLE `products` MODIFY COLUMN `inStock` int NOT NULL;
ALTER TABLE `products` MODIFY COLUMN `createdAt` timestamp NOT NULL;
ALTER TABLE `products` MODIFY COLUMN `updatedAt` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP;
