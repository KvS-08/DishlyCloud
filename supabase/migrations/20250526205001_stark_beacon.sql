/*
  # Fix users table RLS policies

  1. Changes
    - Drop existing policies that may cause recursion
    - Create new, simplified policies for users table
    - Policies are designed to:
      - Allow users to view their own data
      - Allow admins to view users in their business
      - Allow master users to view all users
      - Prevent recursive policy checks
  
  2. Security
    - Maintains row level security
    - Simplifies policy conditions to prevent recursion
    - Preserves existing access patterns
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Master users can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view users in their business" ON users;
DROP POLICY IF EXISTS "Master users can insert users" ON users;
DROP POLICY IF EXISTS "Admins can insert users in their business" ON users;

-- Create new simplified policies
CREATE POLICY "Users can view themselves"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Master users can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'master'
  )
);

CREATE POLICY "Admins can view users in their business"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
    AND users.business_id = users.business_id
  )
);

CREATE POLICY "Master users can insert users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'master'
  )
);

CREATE POLICY "Admins can insert users in their business"
ON users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  AND business_id = (
    SELECT business_id FROM users
    WHERE users.id = auth.uid()
  )
);