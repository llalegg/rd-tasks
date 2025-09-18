-- Custom migration to update task types without underscores
-- First, update the data to use new type names
UPDATE tasks SET type = 'mechanicalanalysis' WHERE type = 'mechanical_analysis';
UPDATE tasks SET type = 'datareporting' WHERE type = 'data_reporting';
UPDATE tasks SET type = 'generaltodo' WHERE type = 'general_to_do';
UPDATE tasks SET type = 'schedulecall' WHERE type = 'schedule_call';
UPDATE tasks SET type = 'coachassignment' WHERE type = 'coach_assignment';
UPDATE tasks SET type = 'createprogram' WHERE type = 'create_program';
UPDATE tasks SET type = 'assessmentreview' WHERE type = 'assessment_review';

-- Now update the enum type
ALTER TABLE "public"."tasks" ALTER COLUMN "type" SET DATA TYPE text;
DROP TYPE "public"."task_type";
CREATE TYPE "public"."task_type" AS ENUM('mechanicalanalysis', 'datareporting', 'injury', 'generaltodo', 'schedulecall', 'coachassignment', 'createprogram', 'assessmentreview');
ALTER TABLE "public"."tasks" ALTER COLUMN "type" SET DATA TYPE "public"."task_type" USING "type"::"public"."task_type";
