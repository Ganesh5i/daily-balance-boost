-- Add type column to notes table to distinguish between tasks and notes
ALTER TABLE public.notes 
ADD COLUMN type text NOT NULL DEFAULT 'task' 
CHECK (type IN ('task', 'note'));