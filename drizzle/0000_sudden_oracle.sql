CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`invite_hash` text NOT NULL,
	`white_hash` text NOT NULL,
	`black_hash` text,
	`pgn` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`resigned` text,
	`created_at` integer NOT NULL
);
