/*
  # Create kitchen_orders table for tracking orders in the kitchen

  1. New Tables
    - `kitchen_orders` - Store kitchen order information
      - `id` (uuid, primary key)
      - `order_number` (integer, order number)
      - `customer_name` (text, optional, for takeout orders)
      - `table_number` (text, optional, for dine-in orders)
      - `items` (jsonb, array of order items)
      - `created_at` (timestamp)
      - `status` (text, order status: pending, completed, cancelled)
      - `business_id` (uuid, foreign key to businesses)

  2. Security
    - Enable RLS on kitchen_orders table
    - Add policies for business-specific access
*/

-- Create kitchen_orders table
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  order_number INTEGER NOT NULL,
  customer_name TEXT,
  table_number TEXT,
  items JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  business_id UUID NOT NULL REFERENCES public.businesses(id)
);

-- Enable Row Level Security
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for kitchen_orders
CREATE POLICY "Users can view kitchen orders in their business"
  ON public.kitchen_orders
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert kitchen orders in their business"
  ON public.kitchen_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update kitchen orders in their business"
  ON public.kitchen_orders
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete kitchen orders in their business"
  ON public.kitchen_orders
  FOR DELETE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_business_id ON public.kitchen_orders(business_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_status ON public.kitchen_orders(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_orders_created_at ON public.kitchen_orders(created_at);