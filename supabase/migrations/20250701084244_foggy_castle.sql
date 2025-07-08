/*
  # Update tables table structure

  1. Changes
    - Make capacity field optional with a default value
    - Add index for better performance on table name searches

  2. Security
    - No changes to RLS policies needed
*/

-- Set default value for capacity field
ALTER TABLE public.tables 
ALTER COLUMN capacity SET DEFAULT 4;

-- Create index for table name searches
CREATE INDEX IF NOT EXISTS idx_tables_name ON public.tables(name);