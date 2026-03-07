CREATE TABLE `BelajarHurufGameState` (
	`user` text PRIMARY KEY NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 0 NOT NULL,
	`weights` text DEFAULT '{}' NOT NULL,
	`updated_at` text NOT NULL
);
