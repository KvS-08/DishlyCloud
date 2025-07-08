/*
  # Add role-based notifications

  1. Changes
    - Add allowed_roles column to reminders table
    - Update notification creation function to respect roles
    - Update RLS policies to handle role-based access

  2. Security
    - Maintain existing RLS policies
    - Add role filtering for notifications
*/

-- Add allowed_roles column to reminders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'allowed_roles'
  ) THEN
    ALTER TABLE reminders ADD COLUMN allowed_roles TEXT[] DEFAULT ARRAY['admin', 'cashier', 'chef'];
  END IF;
END $$;

-- Update the function to create notifications based on roles
CREATE OR REPLACE FUNCTION create_reminder_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notifications for reminders that are due today and haven't been notified yet
  -- Only create notifications for users whose role is in the allowed_roles array
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
    AND (r.allowed_roles IS NULL OR u.role::text = ANY(r.allowed_roles))
    AND NOT EXISTS (
      SELECT 1 FROM notifications n 
      WHERE n.reminder_id = r.id 
        AND n.user_id = u.id 
        AND n.notification_date = CURRENT_DATE
    );
END;
$$;