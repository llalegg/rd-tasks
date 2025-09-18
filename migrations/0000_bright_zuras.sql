CREATE TYPE "public"."history_action" AS ENUM('created', 'status_changed', 'comment_added', 'media_added', 'assigned', 'deadline_changed');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('description', 'comment');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('new', 'in_progress', 'pending', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('mechanical_analysis', 'data_reporting', 'injury', 'general_to_do', 'schedule_call', 'coach_assignment', 'create_program', 'assessment_review');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'coach', 'analyst', 'therapist', 'athlete', 'parent', 'staff');--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sport" text NOT NULL,
	"team" text,
	"position" text
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" text PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_athletes" (
	"task_id" text NOT NULL,
	"athlete_id" text NOT NULL,
	CONSTRAINT "task_athletes_task_id_athlete_id_pk" PRIMARY KEY("task_id","athlete_id")
);
--> statement-breakpoint
CREATE TABLE "task_history" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"action" "history_action" NOT NULL,
	"old_value" text,
	"new_value" text,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_media" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"media_id" text NOT NULL,
	"media_type" "media_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "task_type" NOT NULL,
	"description" text NOT NULL,
	"assignee_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"deadline" timestamp,
	"status" "task_status" DEFAULT 'new' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "task_athletes" ADD CONSTRAINT "task_athletes_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_athletes" ADD CONSTRAINT "task_athletes_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_history" ADD CONSTRAINT "task_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_media" ADD CONSTRAINT "task_media_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_media" ADD CONSTRAINT "task_media_media_id_media_files_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;