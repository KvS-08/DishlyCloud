/*
  # Add tip and tax percentage fields to businesses table

  1. Changes
    - Add tip_percentage field to store tip percentage
    - Add tax_percentage field to store ISV/tax percentage

  2. Security
    - No changes to RLS policies needed as these are just new columns
*/

-- Add tip and tax percentage fields to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'tip_percentage'
  ) THEN
    ALTER TABLE businesses ADD COLUMN tip_percentage DECIMAL(5,2);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'tax_percentage'
  ) THEN
    ALTER TABLE businesses ADD COLUMN tax_percentage DECIMAL(5,2);
  END IF;
END $$;