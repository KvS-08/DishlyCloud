/*
  # Fix users table policies

  1. Changes
    - Drop all existing policies
    - Create new policies without recursion
    - Ensure proper access control for different user roles

  2. Security
    - Maintain RLS security while fixing recursion issues
    - Ensure proper access control for different user roles
*/

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Admins can insert users in their business" ON users;
DROP POLICY IF EXISTS "Admins can view users in their business" ON users;
DROP POLICY IF EXISTS "Master users can insert users" ON users;
DROP POLICY IF EXISTS "Master users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view themselves" ON users;
DROP POLICY IF EXISTS "Master users can manage all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their business" ON users;

-- Create new policies without recursion
CREATE POLICY "allow_master_users"
ON users
FOR ALL
TO authenticated
USING (
  role = 'master'
);

CREATE POLICY "allow_admin_users"
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

CREATE POLICY "allow_self_view"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);