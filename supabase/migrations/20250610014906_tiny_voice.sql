/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Current policies on `users` and `businesses` tables create circular dependencies
    - Policies reference each other in a way that causes infinite recursion
    - This prevents authentication and registration from working

  2. Solution
    - Simplify policies to avoid circular references
    - Use direct auth.uid() checks where possible
    - Remove complex subqueries that cause recursion
    - Ensure policies are straightforward and non-recursive

  3. Changes
    - Drop existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Maintain security while fixing the circular dependency issue
*/

-- Drop existing problematic policies for users table
DROP POLICY IF EXISTS "allow_admin_users" ON users;
DROP POLICY IF EXISTS "allow_master_users" ON users;
DROP POLICY IF EXISTS "allow_self_view" ON users;

-- Drop existing problematic policies for businesses table
DROP POLICY IF EXISTS "Admins can update their own business" ON businesses;
DROP POLICY IF EXISTS "Master users can insert businesses" ON businesses;
DROP POLICY IF EXISTS "Master users can update businesses" ON businesses;
DROP POLICY IF EXISTS "Master users can view all businesses" ON businesses;
DROP POLICY IF EXISTS "Users can view their own business" ON businesses;

-- Create simplified policies for users table
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow user registration"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create simplified policies for businesses table
CREATE POLICY "Business owners can view their business"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Business owners can update their business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow business creation"
  ON businesses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Additional policies for admin access within businesses
CREATE POLICY "Business users can view their business"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT business_id 
      FROM users 
      WHERE id = auth.uid() AND business_id IS NOT NULL
    )
  );

CREATE POLICY "Admin users can update business"
  ON businesses
  FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT business_id 
      FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'master') AND business_id IS NOT NULL
    )
  )
  WITH CHECK (
    id IN (
      SELECT business_id 
      FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'master') AND business_id IS NOT NULL
    )
  );

-- Policy for master users to view all businesses (if needed)
CREATE POLICY "Master users can view all businesses"
  ON businesses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'master'
    )
  );

-- Policy for master users to manage all businesses (if needed)
CREATE POLICY "Master users can manage all businesses"
  ON businesses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'master'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'master'
    )
  );