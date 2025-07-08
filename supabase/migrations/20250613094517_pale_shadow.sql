/*
  # Create POS system tables

  1. New Tables
    - `aperturas` - Cash register opening/closing records
    - `ventas` - Sales transactions
    - `gastos` - Expense records

  2. Security
    - Enable RLS on all tables
    - Add policies for business-specific access
*/

-- Create aperturas table (cash register sessions)
CREATE TABLE IF NOT EXISTS public.aperturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  fecha TIMESTAMPTZ NOT NULL,
  cajero TEXT NOT NULL,
  efectivo_apertura DECIMAL(10, 2) NOT NULL DEFAULT 0,
  venta_total DECIMAL(10, 2) DEFAULT 0,
  gastos DECIMAL(10, 2) DEFAULT 0,
  utilidad DECIMAL(10, 2) DEFAULT 0,
  efectivo_cierre DECIMAL(10, 2) DEFAULT 0,
  hora_cierre TIME,
  estado TEXT DEFAULT 'abierta',
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id)
);

-- Create ventas table (sales transactions)
CREATE TABLE IF NOT EXISTS public.ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  cajero TEXT NOT NULL,
  numero_orden TEXT NOT NULL,
  tipo_orden TEXT DEFAULT 'mesa',
  cliente TEXT,
  producto TEXT NOT NULL,
  notas TEXT,
  estado TEXT DEFAULT 'completada',
  valor DECIMAL(10, 2) NOT NULL,
  tipo_pago TEXT DEFAULT 'efectivo',
  factura TEXT,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  apertura_id UUID REFERENCES public.aperturas(id)
);

-- Create gastos table (expenses)
CREATE TABLE IF NOT EXISTS public.gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo TEXT NOT NULL,
  detalle TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  estado TEXT DEFAULT 'pagado',
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  apertura_id UUID REFERENCES public.aperturas(id)
);

-- Enable Row Level Security
ALTER TABLE public.aperturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for aperturas
CREATE POLICY "Users can view aperturas in their business"
  ON public.aperturas
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert aperturas in their business"
  ON public.aperturas
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update aperturas in their business"
  ON public.aperturas
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create RLS Policies for ventas
CREATE POLICY "Users can view ventas in their business"
  ON public.ventas
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert ventas in their business"
  ON public.ventas
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update ventas in their business"
  ON public.ventas
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create RLS Policies for gastos
CREATE POLICY "Users can view gastos in their business"
  ON public.gastos
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert gastos in their business"
  ON public.gastos
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update gastos in their business"
  ON public.gastos
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aperturas_business_id ON public.aperturas(business_id);
CREATE INDEX IF NOT EXISTS idx_aperturas_fecha ON public.aperturas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_business_id ON public.ventas(business_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_gastos_business_id ON public.gastos(business_id);
CREATE INDEX IF NOT EXISTS idx_gastos_fecha ON public.gastos(fecha);