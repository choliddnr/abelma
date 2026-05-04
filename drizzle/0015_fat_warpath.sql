CREATE TABLE `letter_trace` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`stars` text DEFAULT '{}' NOT NULL,
	`config` text DEFAULT '[500, 600, 700, 800, 1000]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
