/*
  # Create tables table for restaurant table management

  1. New Tables
    - `tables` - Store restaurant table information
      - `id` (uuid, primary key)
      - `name` (text, table name/number)
      - `capacity` (integer, number of seats)
      - `is_available` (boolean, availability status)
      - `business_id` (uuid, foreign key to businesses)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to users)

  2. Security
    - Enable RLS on tables table
    - Add policies for business-specific access
*/

-- Create tables table
CREATE TABLE IF NOT EXISTS public.tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 4,
  is_available BOOLEAN DEFAULT true,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for tables
CREATE POLICY "Users can view tables in their business"
  ON public.tables
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert tables in their business"
  ON public.tables
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update tables in their business"
  ON public.tables
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete tables in their business"
  ON public.tables
  FOR DELETE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tables_business_id ON public.tables(business_id);