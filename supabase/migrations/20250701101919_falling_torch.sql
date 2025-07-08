/*
  # Add business_type field to businesses table

  1. Changes
    - Add business_type field to store the type of business (restaurant, cafe, etc.)

  2. Security
    - No changes to RLS policies needed as this is just a new column
*/

-- Add business_type field to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'business_type'
  ) THEN
    ALTER TABLE businesses ADD COLUMN business_type TEXT;
  END IF;
END $$;