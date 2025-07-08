/*
  # Add additional fields to inventory_items table

  1. Changes
    - Add idp field for internal product identification
    - Add costo_pedido field for order cost
    - Add precio field for selling price
    - Add fecha_agregado field for tracking when item was added
    - Add stock_actual field to track current stock separately from quantity

  2. Security
    - Maintain existing RLS policies
    - Add indexes for better performance
*/

-- Add additional fields to inventory_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'idp'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN idp TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'costo_pedido'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN costo_pedido DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'precio'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN precio DECIMAL(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'fecha_agregado'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN fecha_agregado DATE DEFAULT CURRENT_DATE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items' AND column_name = 'stock_actual'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN stock_actual DECIMAL(10,2);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_fecha_agregado ON inventory_items(fecha_agregado);
CREATE INDEX IF NOT EXISTS idx_inventory_items_idp ON inventory_items(idp);