CREATE TABLE `gf_cms` (
	`id` text PRIMARY KEY NOT NULL,
	`draft` text,
	`published` text,
	`revision` integer DEFAULT 0 NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gf_cms_media` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_gf_cms_media_created` ON `gf_cms_media` (`created`);--> statement-breakpoint
CREATE TABLE `gf_cms_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`content` text NOT NULL,
	`created` text NOT NULL,
	`actor` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_gf_cms_revisions_created` ON `gf_cms_revisions` (`created`);