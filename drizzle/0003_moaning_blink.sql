ALTER TABLE `categories` ADD `iconUrl` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;