/*
  # Add waiter role to user_role enum

  1. Changes
    - Add 'waiter' to the user_role enum type
    - This allows creating users with the waiter role

  2. Security
    - No changes to RLS policies needed as existing policies will apply to the new role
*/

-- Add 'waiter' to user_role enum if it doesn't exist
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'waiter';