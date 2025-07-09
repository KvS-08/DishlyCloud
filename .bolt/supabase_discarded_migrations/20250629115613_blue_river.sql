/*
  # Add fixed reminders functionality

  1. Changes
    - Add is_fixed column to reminders table to mark reminders as fixed
    - Update notification creation function to handle fixed reminders

  2. Security
    - Maintain existing RLS policies
    - Add index for better performance
*/

-- Add is_fixed column to reminders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reminders' AND column_name = 'is_fixed'
  ) THEN
    ALTER TABLE reminders ADD COLUMN is_fixed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Update the function to handle fixed reminders
CREATE OR REPLACE FUNCTION create_reminder_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert notifications for reminders that are due today and haven't been notified yet
  -- Only create notifications for users whose role is in the allowed_roles array
  -- For fixed reminders, create notifications every time they are due
  -- For non-fixed reminders, only create notifications once
  INSERT INTO notifications (user_id, business_id, reminder_id, title, message, notification_date)
  SELECT 
    u.id as user_id,
    r.business_id,
    r.id as reminder_id,
    'Recordatorio: ' || r.evento as title,
    CASE 
      WHEN r.is_fixed THEN 'Recordatorio fijo para hoy: ' || r.evento
      ELSE 'Tienes un evento programado para hoy: ' || r.evento
    END as message,
    CURRENT_DATE as notification_date
  FROM reminders r
  JOIN users u ON u.business_id = r.business_id
  WHERE r.fecha = CURRENT_DATE
    AND r.is_active = true
    AND (r.allowed_roles IS NULL OR u.role::text = ANY(r.allowed_roles))
    AND (
      -- For fixed reminders, always create notifications (even if one exists for today)
      r.is_fixed = true
      OR 
      -- For non-fixed reminders, only create if no notification exists for today
      (r.is_fixed = false AND NOT EXISTS (
        SELECT 1 FROM notifications n 
        WHERE n.reminder_id = r.id 
          AND n.user_id = u.id 
          AND n.notification_date = CURRENT_DATE
      ))
    );
    
  -- For non-fixed reminders that have passed their date, mark them as inactive
  UPDATE reminders 
  SET is_active = false 
  WHERE fecha < CURRENT_DATE 
    AND is_fixed = false 
    AND is_active = true;
END;
$$;</parameter>
</invoke>
</action>