/*
  # Add CAI and RTN fields to businesses table

  1. Changes
    - Add cai field to store Código de Autorización de Impresión (CAI)
    - Add rtn field to store Registro Tributario Nacional (RTN)

  2. Security
    - No changes to RLS policies needed as these are just new columns
*/

-- Add CAI and RTN fields to businesses table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'cai'
  ) THEN
    ALTER TABLE businesses ADD COLUMN cai TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'businesses' AND column_name = 'rtn'
  ) THEN
    ALTER TABLE businesses ADD COLUMN rtn TEXT;
  END IF;
END $$;