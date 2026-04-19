ALTER TABLE `alphabet_challenge_progress` RENAME TO `alphabet_quiz_progress`;--> statement-breakpoint
ALTER TABLE `alphabet_quiz_progress` RENAME COLUMN "challenge_config" TO "quiz_config";--> statement-breakpoint
CREATE TABLE `word_quiz_progress` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`weights` text DEFAULT '{}' NOT NULL,
	`quiz_config` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);