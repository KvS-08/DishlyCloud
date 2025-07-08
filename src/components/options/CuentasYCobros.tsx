import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronUp } from 'react-icons/fa';
import { GrMoney } from 'react-icons/gr';
import { FaPercentage } from 'react-icons/fa';
import { RiVisaFill } from 'react-icons/ri';
import { BsCurrencyExchange } from 'react-icons/bs';
import { GiTakeMyMoney } from 'react-icons/gi';
import { MdNumbers } from 'react-icons/md';
import { FaIdCard } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CuentasYCobrosProps {
  selectedCountry: string;
}

export const CuentasYCobros = React.memo(({ selectedCountry }: CuentasYCobrosProps) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [collectionCurrency, setCollectionCurrency] = useState('');
  const [tip, setTip] = useState('');
  const [isv, setIsv] = useState('');
  const [cai, setCai] = useState('');
  const [rtn, setRtn] = useState('');
  const [loading, setLoading] = useState(false);

  const countryCurrencies: { [key: string]: string[] } = {
    CA: ['CAD'],
    MX: ['MXN'],
    US: ['USD'],
    BZ: ['BZD'],
    CR: ['CRC'],
    SV: ['USD'], // El Salvador uses USD
    GT: ['GTQ'],
    HN: ['HNL'],
    NI: ['NIO'],
    PA: ['PAB', 'USD'], // Panama uses PAB and USD
    AR: ['ARS'],
    BO: ['BOB'],
    BR: ['BRL'],
    CL: ['CLP'],
    CO: ['COP'],
    EC: ['USD'], // Ecuador uses USD
    PY: ['PYG'],
    PE: ['PEN'],
    UY: ['UYU'],
    VE: ['VES'],
  };

  // Load existing business data when component mounts or expands
  useEffect(() => {
    if (isExpanded && user?.business_id) {
      loadBusinessData();
    }
  }, [isExpanded, user?.business_id]);

  const loadBusinessData = async () => {
    if (!user?.business_id) return;

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('bank_account, currency, tip_percentage, tax_percentage, cai, rtn')
        .eq('id', user.business_id)
        .single();

      if (error) {
        console.error('Error loading business data:', error);
        return;
      }

      if (data) {
        setBankAccount(data.bank_account || '');
        setCollectionCurrency(data.currency || '');
        setTip(data.tip_percentage ? data.tip_percentage.toString() : '');
        setIsv(data.tax_percentage ? data.tax_percentage.toString() : '');
        setCai(data.cai || '');
        setRtn(data.rtn || '');
      }
    } catch (error) {
      console.error('Error loading business data:', error);
    }
  };

  const getCurrenciesForCountry = (countryCode: string) => {
    const currencies = countryCurrencies[countryCode] || [];
    if (!currencies.includes('USD') && countryCode !== 'US') {
      return [...currencies, 'USD'];
    }
    return currencies;
  };

  const toggleAccordion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const shouldShowElements = bankAccount || collectionCurrency || tip || isv || cai || rtn;

  const handleSave = async () => {
    if (!user?.business_id) {
      toast.error('No se encontró información del negocio');
      return;
    }

    setLoading(true);

    try {
      // Prepare update data
      const updateData: any = {};
      
      if (bankAccount) updateData.bank_account = bankAccount;
      if (collectionCurrency) updateData.currency = collectionCurrency;
      if (tip) updateData.tip_percentage = parseFloat(tip);
      if (isv) updateData.tax_percentage = parseFloat(isv);
      if (cai) updateData.cai = cai;
      if (rtn) updateData.rtn = rtn;
      
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
        toast.error('Error al guardar la información de cuentas y cobros');
        return;
      }

      toast.success('Información de cuentas y cobros guardada exitosamente');
      
    } catch (error) {
      console.error('Error saving accounts and billing info:', error);
      toast.error('Error al guardar la información de cuentas y cobros');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleAccordion}
      >
        <span className="flex items-center">
          <GrMoney className="w-5 h-5 mr-2" />
          Cuentas y Cobros
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
              <div className="form-group">
                <label htmlFor="bankAccount" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Cuenta bancaria</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <RiVisaFill className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="bankAccount"
                    className="block w-full pl-6 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 1234567890"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="collectionCurrency" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Moneda de cobro</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <BsCurrencyExchange className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                  </div>
                  <select
                    id="collectionCurrency"
                    className="block w-full pl-5 pr-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-[0.6rem] text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={collectionCurrency}
                    onChange={(e) => setCollectionCurrency(e.target.value)}
                  >
                    <option value="">Escoge una moneda</option>
                    {selectedCountry && getCurrenciesForCountry(selectedCountry).map((currency) => (
                        <option key={currency} value={currency}>
                          {currency}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="tip" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Propina (%)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <GiTakeMyMoney className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="tip"
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 10"
                    min="0"
                    max="100"
                    step="0.01"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="isv" className="block text-xs font-medium text-gray-700 dark:text-gray-300">ISV (%)</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaPercentage className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="isv"
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 15"
                    min="0"
                    max="100"
                    step="0.01"
                    value={isv}
                    onChange={(e) => setIsv(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="cai" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Código CAI</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <MdNumbers className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cai"
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 12345-67890-12345-ABCDE"
                    value={cai}
                    onChange={(e) => setCai(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="rtn" className="block text-xs font-medium text-gray-700 dark:text-gray-300">RTN</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                    <FaIdCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="rtn"
                    className="block w-full pl-7 pr-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: 08019999123456"
                    value={rtn}
                    onChange={(e) => setRtn(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {shouldShowElements && (
              <>
                <hr className="border-gray-400 my-0 mx-auto w-11/12" />
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});