CREATE TABLE `ddv_progress` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`learning_level` integer DEFAULT 1 NOT NULL,
	`level_scores` text DEFAULT '{}' NOT NULL,
	`quiz_score` integer DEFAULT 0 NOT NULL,
	`quiz_level` integer DEFAULT 1 NOT NULL,
	`quiz_weights` text DEFAULT '{}' NOT NULL,
	`learning_weights` text DEFAULT '{}' NOT NULL,
	`quiz_config` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
