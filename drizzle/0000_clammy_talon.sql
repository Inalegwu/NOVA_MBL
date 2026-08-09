CREATE TABLE `issues` (
	`id` text PRIMARY KEY NOT NULL,
	`file_path` text NOT NULL,
	`series` text NOT NULL,
	`title` text NOT NULL,
	`page_count` integer NOT NULL,
	`size_bytes` integer NOT NULL,
	`added_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reading_progress` (
	`issue_id` text PRIMARY KEY NOT NULL,
	`current_page` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`issue_id`) REFERENCES `issues`(`id`) ON UPDATE no action ON DELETE no action
);
