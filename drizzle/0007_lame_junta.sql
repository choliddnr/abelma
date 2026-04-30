ALTER TABLE `user` ADD `tier` text DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `premium_until` integer;--> statement-breakpoint
ALTER TABLE `user` ADD `midtrans_customer_id` text;--> statement-breakpoint
ALTER TABLE `user` ADD `midtrans_subscription_id` text;