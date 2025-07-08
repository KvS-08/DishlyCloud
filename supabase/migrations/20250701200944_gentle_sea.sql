/*
  # Add product type and recipes table

  1. New Tables
    - `recetas` - Store recipe information for menu items
      - `id` (uuid, primary key)
      - `menu_item_id` (uuid, foreign key to menu_items)
      - `inventory_item_id` (uuid, foreign key to inventory_items)
      - `quantity` (decimal, amount to reduce from inventory)
      - `created_at` (timestamp)
      - `business_id` (uuid, foreign key to businesses)

  2. Changes
    - Add `product_type` field to menu_items table
      - Values: 'individual' or 'compuesto'

  3. Security
    - Enable RLS on recetas table
    - Add policies for business-specific access
*/

-- Add product_type field to menu_items table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN product_type TEXT DEFAULT 'individual';
  END IF;
END $$;

-- Create recetas table
CREATE TABLE IF NOT EXISTS public.recetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  business_id UUID NOT NULL REFERENCES public.businesses(id)
);

-- Enable Row Level Security
ALTER TABLE public.recetas ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for recetas
CREATE POLICY "Users can view recetas in their business"
  ON public.recetas
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert recetas in their business"
  ON public.recetas
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update recetas in their business"
  ON public.recetas
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete recetas in their business"
  ON public.recetas
  FOR DELETE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recetas_menu_item_id ON public.recetas(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_recetas_inventory_item_id ON public.recetas(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_recetas_business_id ON public.recetas(business_id);