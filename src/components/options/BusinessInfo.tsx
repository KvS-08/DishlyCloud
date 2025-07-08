import { FaChevronUp } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { MdOutlineDriveFileRenameOutline } from 'react-icons/md';
import { IoBusinessSharp } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { BiWorld } from 'react-icons/bi';
import { FaTreeCity } from 'react-icons/fa6';
import { FaMapLocationDot } from 'react-icons/fa6';
import { MdAlternateEmail } from 'react-icons/md';
import { FaPhone } from 'react-icons/fa';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface BusinessInfoProps {
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}

export const BusinessInfo = React.memo(({ selectedCountry, setSelectedCountry }: BusinessInfoProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [logoPreview, setLogoPreview] = useState('/public/images/logo_placeholder.png');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [showSaveSection, setShowSaveSection] = useState(false);
  const [loading, setLoading] = useState(false);

  const countryPhonePrefixes: { [key: string]: string } = {
    CA: '+1',
    MX: '+52',
    US: '+1',
    BZ: '+501',
    CR: '+506',
    SV: '+503',
    GT: '+502',
    HN: '+504',
    NI: '+505',
    PA: '+507',
    AR: '+54',
    BO: '+591',
    BR: '+55',
    CL: '+56',
    CO: '+57',
    EC: '+593',
    PY: '+595',
    PE: '+51',
    UY: '+598',
    VE: '+58',
  };

  // Load existing business data when component mounts
  useEffect(() => {
    if (user?.business_id) {
      loadBusinessData();
    }
  }, [user?.business_id]);

  useEffect(() => {
    if (selectedCountry && countryPhonePrefixes[selectedCountry]) {
      setPhonePrefix(countryPhonePrefixes[selectedCountry]);
    } else {
      setPhonePrefix('');
    }

    const hasInput = businessName || businessType || city || phoneNumber || selectedCountry || email || address;
    setShowSaveSection(!!hasInput);
  }, [selectedCountry, businessName, businessType, city, phoneNumber, email, address]);

  const loadBusinessData = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', user.business_id)
        .single();

      if (error) {
        console.error('Error loading business data:', error);
        return;
      }

      if (data) {
        setBusinessName(data.name || '');
        // Check if business_type exists in the data
        if (data.business_type) {
          setBusinessType(data.business_type || '');
        }
        setCity(data.city || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        
        // Extract phone number and prefix
        if (data.phone) {
          const phoneMatch = data.phone.match(/^(\+\d+)(.+)$/);
          if (phoneMatch) {
            setPhonePrefix(phoneMatch[1]);
            setPhoneNumber(phoneMatch[2]);
          } else {
            setPhoneNumber(data.phone);
          }
        }

        // Set country based on phone prefix or existing country
        if (data.country) {
          setSelectedCountry(data.country);
        }

        // Set logo if exists
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error('El tamaño del archivo no debe exceder 1MB.');
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile || !user?.business_id) return null;

    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${user.business_id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(fileName, logoFile, {
          upsert: true
        });

      if (uploadError) {
        console.error('Error uploading logo:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('business-logos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user?.business_id) {
      toast.error('No se encontró información del negocio');
      return;
    }

    setLoading(true);

    try {
      let logoUrl = null;
      
      // Upload logo if a new file was selected
      if (logoFile) {
        logoUrl = await uploadLogo();
        if (!logoUrl) {
          toast.error('Error al subir el logo');
          setLoading(false);
          return;
        }
      }

      // Prepare update data
      const updateData: any = {};
      
      if (businessName) updateData.name = businessName;
      if (businessType) updateData.business_type = businessType; // Add business_type to the update data
      if (city) updateData.city = city;
      if (email) updateData.email = email;
      if (address) updateData.address = address;
      if (selectedCountry) updateData.country = selectedCountry;
      if (phonePrefix && phoneNumber) updateData.phone = `${phonePrefix}${phoneNumber}`;
      if (logoUrl) updateData.logo_url = logoUrl;

      // Only update if there's data to update
      if (Object.keys(updateData).length === 0) {
        toast.error('No hay cambios para guardar');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', user.business_id);

      if (error) {
        console.error('Error updating business:', error);
        toast.error('Error al guardar la información del negocio');
        return;
      }

      toast.success('Información del negocio guardada exitosamente');
      
      // Reset the logo file after successful upload
      setLogoFile(null);
      
    } catch (error) {
      console.error('Error saving business info:', error);
      toast.error('Error al guardar la información del negocio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <button 
        className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <BsFillInfoCircleFill className="w-5 h-5 mr-2" />
          Información del Negocio
        </span>
        <FaChevronUp className={`w-4 h-4 transform transition-transform duration-200 ${!isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-b-lg"
          >
          <form className="space-y-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              <div className="form-group">
                <label htmlFor="businessName" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Nombre del Negocio</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <MdOutlineDriveFileRenameOutline className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="businessName" 
                    className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: Mi Negocio"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="businessType" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de Negocio</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <IoBusinessSharp className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="businessType" 
                    className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: Restaurante"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group col-span-full sm:col-span-1">
                <label htmlFor="logo" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Logo del Negocio</label>
                <div className="mt-1 flex items-center space-x-5">
                  <div className="flex-shrink-0 h-8 w-32 rounded-md overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center border-2 border-gray-300 dark:border-gray-600">
                    <img src={logoPreview} alt="Logo" className="h-3/4 w-1/2 object-contain" />
                  </div>
                  <input
                    type="file"
                    id="logoUpload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center text-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full"
                    onClick={() => document.getElementById('logoUpload')?.click()}
                  >
                    Subir Logo
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
              <div className="form-group">
                <label htmlFor="country" className="block text-xs font-medium text-gray-700 dark:text-gray-300">País</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <BiWorld className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    id="country"
                    className="block w-full pl-6 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-[0.6rem] text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Selecciona un país</option>
                    <optgroup label="Norteamérica" className="text-[0.6rem]">
                      <option value="CA">Canadá</option>
                      <option value="MX">México</option>
                      <option value="US">Estados Unidos</option>
                    </optgroup>
                    <optgroup label="Centroamérica" className="text-[0.6rem]">
                      <option value="BZ">Belice</option>
                      <option value="CR">Costa Rica</option>
                      <option value="SV">El Salvador</option>
                      <option value="GT">Guatemala</option>
                      <option value="HN">Honduras</option>
                      <option value="NI">Nicaragua</option>
                      <option value="PA">Panamá</option>
                    </optgroup>
                    <optgroup label="Sudamérica" className="text-[0.6rem]">
                      <option value="AR">Argentina</option>
                      <option value="BO">Bolivia</option>
                      <option value="BR">Brasil</option>
                      <option value="CL">Chile</option>
                      <option value="CO">Colombia</option>
                      <option value="EC">Ecuador</option>
                      <option value="PY">Paraguay</option>
                      <option value="PE">Perú</option>
                      <option value="UY">Uruguay</option>
                      <option value="VE">Venezuela</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="city" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Ciudad</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaTreeCity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="city" 
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: Ciudad de México"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group col-span-full sm:col-span-1">
                <label htmlFor="address" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Dirección</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaMapLocationDot className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="address" 
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: Calle Falsa 123" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <MdAlternateEmail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: info@minegocio.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Número de Teléfono</label>
                <div className="mt-1 relative rounded-md shadow-sm flex">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaPhone className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    id="phonePrefix"
                    className="block w-1/3 pl-6 pr-0 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                  >
                    <option value="">Prefijo</option>
                    {Object.entries(countryPhonePrefixes).map(([countryCode, prefix]) => (
                      <option key={countryCode} value={prefix}>
                        {prefix}
                      </option>
                    ))}
                  </select>
                  <input 
                    type="text" 
                    id="phoneNumber" 
                    className="block w-2/3 pl-1 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-r-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Ej: 55 1234 5678" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {showSaveSection && (
              <>
                <hr className="border-t border-gray-400 my-0 mx-auto w-11/12" />
                <div className="p-2.5 flex justify-end mr-1">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={loading}
                    className="text-green-500 hover:text-green-400 font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </>
            )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});