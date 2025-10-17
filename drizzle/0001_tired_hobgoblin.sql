CREATE TABLE `tracked_projects` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`title` text NOT NULL,
	`organization_login` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_projects_project_id_unique` ON `tracked_projects` (`project_id`);--> statement-breakpoint
CREATE TABLE `tracked_repositories` (
	`id` integer PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
DROP TABLE `todos`;