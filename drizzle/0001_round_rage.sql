CREATE TABLE `storybook_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`letter` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`last_read` text NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storybook_unique_idx` ON `storybook_progress` (`profile_id`,`letter`);