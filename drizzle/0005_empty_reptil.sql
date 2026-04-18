CREATE TABLE `word_challenge_progress` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`weights` text DEFAULT '{}' NOT NULL,
	`challenge_config` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
