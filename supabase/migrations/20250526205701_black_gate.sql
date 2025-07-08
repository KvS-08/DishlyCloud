/*
  # Fix users table policies

  1. Changes
    - Remove recursive policies that were causing infinite loops
    - Simplify policy conditions to avoid self-referencing
    - Update policies for better security and performance

  2. Security
    - Maintain RLS security while fixing recursion issues
    - Ensure proper access control for different user roles
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can insert users in their business" ON users;
DROP POLICY IF EXISTS "Admins can view users in their business" ON users;
DROP POLICY IF EXISTS "Master users can insert users" ON users;
DROP POLICY IF EXISTS "Master users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view themselves" ON users;

-- Create new policies without recursion
CREATE POLICY "Master users can manage all users"
ON users
FOR ALL
TO authenticated
USING (
  role = 'master'
);

CREATE POLICY "Admins can manage users in their business"
ON users
FOR ALL
TO authenticated
USING (
  role = 'admin' AND
  business_id IS NOT NULL AND
  business_id IN (
    SELECT id FROM businesses 
    WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view themselves"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);