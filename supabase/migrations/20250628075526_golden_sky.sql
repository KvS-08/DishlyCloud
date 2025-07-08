/*
  # Add username field to users table

  1. Changes
    - Add username field to users table
    - Make email nullable since employees will use username
    - Add unique constraint on username
    - Update existing policies

  2. Security
    - Maintain existing RLS policies
    - Ensure username uniqueness across the platform
*/

-- Add username field to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
  END IF;
END $$;

-- Make email nullable for employees who will use username
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Create index for username for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);