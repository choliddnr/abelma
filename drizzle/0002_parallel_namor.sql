ALTER TABLE `alphabet_progress` RENAME TO `alphabet_challenge_progress`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_alphabet_challenge_progress` (
	`profile_id` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`is_finished` integer DEFAULT false NOT NULL,
	`weights` text DEFAULT '{}' NOT NULL,
	`challenge_config` text DEFAULT '[]' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_alphabet_challenge_progress`("profile_id", "score", "level", "is_finished", "weights", "challenge_config", "created_at", "updated_at") SELECT "profile_id", "score", "level", "is_finished", "weights", "challenge_config", "created_at", "updated_at" FROM `alphabet_challenge_progress`;--> statement-breakpoint
DROP TABLE `alphabet_challenge_progress`;--> statement-breakpoint
ALTER TABLE `__new_alphabet_challenge_progress` RENAME TO `alphabet_challenge_progress`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at") SELECT "id", "account_id", "provider_id", "user_id", "access_token", "refresh_token", "id_token", "access_token_expires_at", "refresh_token_expires_at", "scope", "password", "created_at", "updated_at" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id") SELECT "id", "expires_at", "token", "created_at", "updated_at", "ip_address", "user_agent", "user_id" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `__new_analytics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`type` text NOT NULL,
	`target_id` text NOT NULL,
	`mistakes` integer DEFAULT 0 NOT NULL,
	`last_attempt` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_analytics`("id", "profile_id", "type", "target_id", "mistakes", "last_attempt", "created_at", "updated_at") SELECT "id", "profile_id", "type", "target_id", "mistakes", "last_attempt", "created_at", "updated_at" FROM `analytics`;--> statement-breakpoint
DROP TABLE `analytics`;--> statement-breakpoint
ALTER TABLE `__new_analytics` RENAME TO `analytics`;--> statement-breakpoint
CREATE UNIQUE INDEX `analytics_unique_idx` ON `analytics` (`profile_id`,`type`,`target_id`);--> statement-breakpoint
CREATE TABLE `__new_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text NOT NULL,
	`coins` integer DEFAULT 0 NOT NULL,
	`letter_case` text DEFAULT 'uppercase' NOT NULL,
	`timer_duration` integer DEFAULT 30 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_profiles`("id", "user_id", "name", "avatar", "coins", "letter_case", "timer_duration", "created_at", "updated_at") SELECT "id", "user_id", "name", "avatar", "coins", "letter_case", "timer_duration", "created_at", "updated_at" FROM `profiles`;--> statement-breakpoint
DROP TABLE `profiles`;--> statement-breakpoint
ALTER TABLE `__new_profiles` RENAME TO `profiles`;--> statement-breakpoint
CREATE TABLE `__new_rewards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`title` text NOT NULL,
	`cost` integer NOT NULL,
	`emoji` text NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`claimed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rewards`("id", "profile_id", "title", "cost", "emoji", "status", "claimed_at", "created_at", "updated_at") SELECT "id", "profile_id", "title", "cost", "emoji", "status", "claimed_at", "created_at", "updated_at" FROM `rewards`;--> statement-breakpoint
DROP TABLE `rewards`;--> statement-breakpoint
ALTER TABLE `__new_rewards` RENAME TO `rewards`;--> statement-breakpoint
CREATE TABLE `__new_stickers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`sticker_id` text NOT NULL,
	`earned_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_stickers`("id", "profile_id", "sticker_id", "earned_at", "created_at", "updated_at") SELECT "id", "profile_id", "sticker_id", "earned_at", "created_at", "updated_at" FROM `stickers`;--> statement-breakpoint
DROP TABLE `stickers`;--> statement-breakpoint
ALTER TABLE `__new_stickers` RENAME TO `stickers`;--> statement-breakpoint
CREATE TABLE `__new_storybook_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profile_id` text NOT NULL,
	`letter` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	`last_read` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_storybook_progress`("id", "profile_id", "letter", "is_completed", "last_read", "created_at", "updated_at") SELECT "id", "profile_id", "letter", "is_completed", "last_read", "created_at", "updated_at" FROM `storybook_progress`;--> statement-breakpoint
DROP TABLE `storybook_progress`;--> statement-breakpoint
ALTER TABLE `__new_storybook_progress` RENAME TO `storybook_progress`;--> statement-breakpoint
CREATE UNIQUE INDEX `storybook_unique_idx` ON `storybook_progress` (`profile_id`,`letter`);