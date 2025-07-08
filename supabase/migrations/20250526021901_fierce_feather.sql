/*
  # Initial Schema Setup for Restaurant Management Platform

  1. New Tables
    - `users` - Store user information and roles
    - `businesses` - Store restaurant business information
    - `categories` - Menu categories for each business
    - `menu_items` - Food and drink items for each restaurant
    - `inventory_items` - Inventory/ingredients tracking
    - `menu_item_ingredients` - Relation between menu items and their ingredients
    - `orders` - Customer orders information
    - `order_items` - Individual items in an order
    - `expenses` - Business expenses tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their roles
    - Ensure data isolation between different businesses
*/

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('master', 'admin', 'cashier', 'chef');
CREATE TYPE public.order_status AS ENUM ('open', 'processing', 'completed', 'cancelled');
CREATE TYPE public.order_item_status AS ENUM ('pending', 'preparing', 'ready', 'served', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash', 'credit_card', 'debit_card', 'mobile_payment', 'other');

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  logo_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  email TEXT,
  phone TEXT,
  bank_account TEXT,
  is_active BOOLEAN DEFAULT true,
  currency TEXT DEFAULT 'HNL',
  language TEXT DEFAULT 'es',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT 'HH:mm',
  theme TEXT DEFAULT 'light',
  primary_color TEXT,
  notification_type TEXT DEFAULT 'sound'
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'cashier',
  business_id UUID REFERENCES public.businesses(id),
  is_active BOOLEAN DEFAULT true
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  is_active BOOLEAN DEFAULT true
);

-- Create menu_items table
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  includes_tax BOOLEAN DEFAULT false,
  preparation_time INTEGER NOT NULL, -- in minutes
  category_id UUID NOT NULL REFERENCES public.categories(id),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  image_url TEXT,
  is_available BOOLEAN DEFAULT true
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  min_stock_level DECIMAL(10, 2) NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  cost_per_unit DECIMAL(10, 2) NOT NULL
);

-- Create menu_item_ingredients table
CREATE TABLE IF NOT EXISTS public.menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  quantity DECIMAL(10, 2) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  customer_name TEXT,
  table_number INTEGER,
  status order_status DEFAULT 'open',
  payment_method payment_method,
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  completed_at TIMESTAMPTZ,
  is_takeout BOOLEAN DEFAULT false
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status order_item_status DEFAULT 'pending',
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category TEXT,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Businesses policies
CREATE POLICY "Master users can view all businesses" 
  ON public.businesses FOR SELECT 
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'master'));

CREATE POLICY "Users can view their own business" 
  ON public.businesses FOR SELECT 
  TO authenticated
  USING (id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Master users can insert businesses" 
  ON public.businesses FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'master'));

CREATE POLICY "Master users can update businesses" 
  ON public.businesses FOR UPDATE 
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'master'));

CREATE POLICY "Admins can update their own business" 
  ON public.businesses FOR UPDATE 
  TO authenticated
  USING (id = (SELECT business_id FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Users policies
CREATE POLICY "Master users can view all users" 
  ON public.users FOR SELECT 
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'master'));

CREATE POLICY "Admins can view users in their business" 
  ON public.users FOR SELECT 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin') AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view themselves" 
  ON public.users FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Master users can insert users" 
  ON public.users FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE role = 'master'));

CREATE POLICY "Admins can insert users in their business" 
  ON public.users FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin') AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

-- Categories policies
CREATE POLICY "Users can view categories in their business" 
  ON public.categories FOR SELECT 
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert categories" 
  ON public.categories FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update categories" 
  ON public.categories FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

-- Menu items policies
CREATE POLICY "Users can view menu items in their business" 
  ON public.menu_items FOR SELECT 
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert menu items" 
  ON public.menu_items FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update menu items" 
  ON public.menu_items FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

-- Inventory items policies
CREATE POLICY "Users can view inventory in their business" 
  ON public.inventory_items FOR SELECT 
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Admins can insert inventory" 
  ON public.inventory_items FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update inventory" 
  ON public.inventory_items FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

-- Menu item ingredients policies
CREATE POLICY "Users can view menu item ingredients" 
  ON public.menu_item_ingredients FOR SELECT 
  TO authenticated
  USING (
    menu_item_id IN (
      SELECT id FROM public.menu_items 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can insert menu item ingredients" 
  ON public.menu_item_ingredients FOR INSERT 
  TO authenticated
  WITH CHECK (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    menu_item_id IN (
      SELECT id FROM public.menu_items 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can update menu item ingredients" 
  ON public.menu_item_ingredients FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    menu_item_id IN (
      SELECT id FROM public.menu_items 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Orders policies
CREATE POLICY "Users can view orders in their business" 
  ON public.orders FOR SELECT 
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert orders in their business" 
  ON public.orders FOR INSERT 
  TO authenticated
  WITH CHECK (
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update orders in their business" 
  ON public.orders FOR UPDATE 
  TO authenticated
  USING (
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

-- Order items policies
CREATE POLICY "Users can view order items" 
  ON public.order_items FOR SELECT 
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can insert order items" 
  ON public.order_items FOR INSERT 
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update order items" 
  ON public.order_items FOR UPDATE 
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Expenses policies
CREATE POLICY "Users can view expenses in their business" 
  ON public.expenses FOR SELECT 
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert expenses in their business" 
  ON public.expenses FOR INSERT 
  TO authenticated
  WITH CHECK (
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can update expenses" 
  ON public.expenses FOR UPDATE 
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE role IN ('admin', 'master')) AND
    business_id = (SELECT business_id FROM public.users WHERE id = auth.uid())
  );