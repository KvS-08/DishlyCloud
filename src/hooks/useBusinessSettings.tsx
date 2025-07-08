import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface BusinessSettings {
  time_format: string;
  currency: string;
  language: string;
  date_format: string;
  theme: string;
  // Add other settings as needed
}

export const useBusinessSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.business_id) {
        setSettings({
          time_format: '24h',
          currency: 'HNL',
          language: 'es',
          date_format: 'DD/MM/YYYY',
          theme: 'light'
        });
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('time_format, currency, language, date_format, theme')
          .eq('id', user.business_id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') { // No rows found
            setSettings({
              time_format: '24h',
              currency: 'HNL',
              language: 'es',
              date_format: 'DD/MM/YYYY',
              theme: 'light'
            });
          } else {
            setError(error.message);
          }
        } else if (data) {
          setSettings(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.business_id]);

  return { settings, loading, error };
};