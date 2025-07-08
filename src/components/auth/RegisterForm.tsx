import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building2, User, Mail, Phone, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

type RegisterFormInputs = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
};

interface RegisterFormProps {
  onBackToLogin: () => void;
}

const COUNTRY_CODES = [
  { code: '+504', country: 'Honduras' },
  { code: '+1', country: 'Estados Unidos' },
  { code: '+52', country: 'México' },
  { code: '+503', country: 'El Salvador' },
  { code: '+502', country: 'Guatemala' },
  { code: '+505', country: 'Nicaragua' },
  { code: '+506', country: 'Costa Rica' },
  { code: '+507', country: 'Panamá' },
  { code: '+34', country: 'España' },
  { code: '+57', country: 'Colombia' },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const [loading, setLoading] = useState(false);
  const { 
    register, 
    handleSubmit,
    watch,
    setError,
    formState: { errors }
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      countryCode: '+504'
    }
  });
  
  const password = watch('password');
  
  const onSubmit = async (data: RegisterFormInputs) => {
    if (data.password !== data.confirmPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: 'Las contraseñas no coinciden'
      });
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.ownerName,
          }
        }
      });

      if (authError) {
        // Handle specific case of user already exists
        if (authError.message?.includes('already registered') || authError.message?.includes('user_already_exists')) {
          setError('email', {
            type: 'manual',
            message: 'Este correo ya está registrado'
          });
          return;
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Wait for the session to be established and then create business record
      // We need to ensure the user is properly authenticated before creating business
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        // If no session, try to sign in the user
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        
        if (signInError) throw signInError;
        if (!signInData.user) throw new Error('No se pudo autenticar el usuario');
      }

      // 3. Create business record with proper authentication context
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: data.businessName,
          owner_id: authData.user.id,
          email: data.email,
          phone: `${data.countryCode}${data.phone}`,
          is_active: true,
        })
        .select()
        .single();

      if (businessError) {
        console.error('Business creation error:', businessError);
        throw new Error('Error al crear el negocio: ' + businessError.message);
      }

      // 4. Create user profile
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: data.ownerName,
          role: 'admin',
          business_id: businessData.id,
          is_active: true,
        });

      if (userError) {
        console.error('User profile creation error:', userError);
        throw new Error('Error al crear el perfil de usuario: ' + userError.message);
      }

      toast.success('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      onBackToLogin();
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Error al registrar el negocio';
      
      if (error.message?.includes('Password')) {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (error.message?.includes('row-level security')) {
        errorMessage = 'Error de permisos. Por favor, intenta nuevamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError('root', {
        type: 'manual',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md dark:bg-gray-800 transition-opacity duration-500 ease-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Registra tu Negocio
        </h1>

      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 text-sm text-danger-800 bg-danger-100 rounded-md dark:text-danger-400 dark:bg-danger-900/30">
            {errors.root.message}
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <div className="space-y-0">
            <label htmlFor="businessName" className="label">
              Nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <Building2 className="h-3 w-3 text-gray-400" />
              </div>
              <input
                id="businessName"
                type="text"
                className={`input pl-6 w-full ${errors.businessName ? 'border-red-500' : ''}`}
                placeholder="Rest. El Buen Sabor"
                disabled={loading}
                {...register('businessName', {
                  required: 'El nombre del negocio es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.businessName.message}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-0">
            <label htmlFor="ownerName" className="label">
              Tu Nombre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <User className="h-3 w-3 text-gray-400" />
              </div>
              <input
                id="ownerName"
                type="text"
                className={`input pl-6 w-full ${errors.ownerName ? 'border-red-500' : ''}`}
                placeholder="Juan Pérez"
                disabled={loading}
                {...register('ownerName', {
                  required: 'Tu nombre es requerido',
                  minLength: {
                    value: 2,
                    message: 'El nombre debe tener al menos 2 caracteres'
                  }
                })}
              />
              {errors.ownerName && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.ownerName.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <div className="space-y-0">
            <label htmlFor="email" className="label">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <Mail className="h-3 w-3 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className={`input pl-6 w-full ${errors.email ? 'border-red-500' : ''}`}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                {...register('email', {
                  required: 'El correo electrónico es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Formato de correo electrónico inválido'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-0">
            <label htmlFor="phone" className="label">
              Número Móvil
            </label>
            <div className="flex">
              <select
                {...register('countryCode')}
                className="input rounded-r-none border-r-0 pl-0 w-12.1 text-xs"
                disabled={loading}
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 -left-1.5 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-3 w-3 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="number"
                  pattern="[0-9]*"
                  className={`input pl-6 w-full rounded-l-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="Ej: 9876-5432"
                  disabled={loading}
                  {...register('phone', {
                    required: 'El número de teléfono es requerido',
                    pattern: {
                      value: /^\d{8,15}$/,
                      message: 'Número de teléfono inválido'
                    }
                  })}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <div className="space-y-0">
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <Lock className="h-3 w-3 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                className={`input pl-6 w-full ${errors.password ? 'border-red-500' : ''}`}
                placeholder="**************"
                disabled={loading}
                {...register('password', {
                  required: 'La contraseña es requerida',
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                  }
                })}
              />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-0">
              <label htmlFor="confirmPassword" className="label">
                Confirmarla
              </label>
              <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                <Lock className="h-3 w-3 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                className={`input pl-6 w-full ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="**************"
                disabled={loading}
                {...register('confirmPassword', {
                  required: 'Confirmar contraseña es requerido',
                  validate: value =>
                    value === password || 'Las contraseñas no coinciden'
                })}
              />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-1 sm:flex-row sm:justify-center gap-4">
            <button
            type="button"
            onClick={onBackToLogin}
            className="btn-secondary w-full flex items-center"
            disabled={loading}
          >
            Ir al Login
          </button>
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
          </div>
        </form>
        
        <div className="text-center text-sm mt-0">
          <p className="text-gray-600 dark:text-gray-400">
            Al registrarte, aceptas nuestros{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Términos
            </a>
            {' '}y{' '}
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Políticas.
            </a>
          </p>
        </div>
      </div>
    );
  };