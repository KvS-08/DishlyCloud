/*
  # Create reminders table and notification system

  1. New Tables
    - `reminders` - Store reminder events
    - `notifications` - Store user notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for business-specific access

  3. Functions
    - Function to check and create notifications for due reminders
*/

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  evento TEXT NOT NULL,
  fecha DATE NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  business_id UUID NOT NULL REFERENCES public.businesses(id),
  reminder_id UUID NOT NULL REFERENCES public.reminders(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  notification_date DATE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for reminders
CREATE POLICY "Users can view reminders in their business"
  ON public.reminders
  FOR SELECT
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert reminders in their business"
  ON public.reminders
  FOR INSERT
  TO authenticated
  WITH CHECK (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update reminders in their business"
  ON public.reminders
  FOR UPDATE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete reminders in their business"
  ON public.reminders
  FOR DELETE
  TO authenticated
  USING (business_id = (SELECT business_id FROM public.users WHERE id = auth.uid()));

-- Create RLS Policies for notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_business_id ON public.reminders(business_id);
CREATE INDEX IF NOT EXISTS idx_reminders_fecha ON public.reminders(fecha);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON public.notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_date ON public.notifications(notification_date);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- Function to create notifications for due reminders
CREATE OR REPLACE FUNCTION create_reminder_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notifications for reminders that are due today and haven't been notified yet
  INSERT INTO notifications (user_id, business_id, reminder_id, title, message, notification_date)
  SELECT 
    u.id as user_id,
    r.business_id,
    r.id as reminder_id,
    'Recordatorio: ' || r.evento as title,
    'Tienes un evento programado para hoy: ' || r.evento as message,
    CURRENT_DATE as notification_date
  FROM reminders r
  JOIN users u ON u.business_id = r.business_id
  WHERE r.fecha = CURRENT_DATE
    AND r.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.reminder_id = r.id 
        AND n.user_id = u.id 
        AND n.notification_date = CURRENT_DATE
    );
END;
$$;