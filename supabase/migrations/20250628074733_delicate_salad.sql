/*
  # Create expense categories table

  1. New Tables
    - `expense_categories` - Store predefined expense categories for each business
      - `id` (uuid, primary key)
      - `name` (text, category name)
      - `type` (text, category type)
      - `business_id` (uuid, foreign key to businesses)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to users)

  2. Security
    - Enable RLS on expense_categories table
    - Add policies for business-specific access
*/

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for expense_categories
CREATE POLICY "Users can view expense categories in their business"
  ON public.expense_categories
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert expense categories in their business"
  ON public.expense_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update expense categories in their business"
  ON public.expense_categories
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete expense categories in their business"
  ON public.expense_categories
  FOR DELETE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_expense_categories_business_id ON public.expense_categories(business_id);