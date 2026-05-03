PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cvc_progress` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`learning_level` integer DEFAULT 1 NOT NULL,
	`level_scores` text DEFAULT '{}' NOT NULL,
	`quiz_score` integer DEFAULT 0 NOT NULL,
	`quiz_level` integer DEFAULT 1 NOT NULL,
	`quiz_weights` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_cvc_progress`("profile_id", "score", "learning_level", "level_scores", "quiz_score", "quiz_level", "quiz_weights", "created_at", "updated_at") SELECT "profile_id", "score", "learning_level", "level_scores", "quiz_score", "quiz_level", "quiz_weights", "created_at", "updated_at" FROM `cvc_progress`;--> statement-breakpoint
DROP TABLE `cvc_progress`;--> statement-breakpoint
ALTER TABLE `__new_cvc_progress` RENAME TO `cvc_progress`;--> statement-breakpoint
PRAGMA foreign_keys=ON;