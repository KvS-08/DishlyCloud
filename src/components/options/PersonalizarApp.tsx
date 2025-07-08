import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useCallback } from 'react';
import { FaPalette } from 'react-icons/fa'; // Icon for app customization
import { FaChevronUp } from 'react-icons/fa';

export const PersonalizarApp = React.memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [timeFormat, setTimeFormat] = useState('');

  const shouldShowElements = dateFormat || timeFormat || notificationType;

  const toggleAccordion = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);


  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mt-4">
      <button
        className="flex justify-between items-center w-full p-4 text-left text-gray-900 dark:text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={toggleAccordion}
      >
        <span className="flex items-center">
          <FaPalette className="w-5 h-5 mr-2" />
          Personalizar App
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
            className="overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-b-lg p-4"
          >
            {/* Content for Personalizar App goes here */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="dateFormat" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Formato de Fecha</label>
                <input type="text" id="dateFormat" className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: dd/mm/yyyy" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="timeFormat" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Formato de Hora</label>
                <input type="text" id="timeFormat" className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Ej: HH:mm" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="notificationType" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de Notificaciones</label>
                <select
                  id="notificationType"
                  className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={notificationType}
                  onChange={(e) => setNotificationType(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="push">Push</option>
                  <option value="sounds">Sonidos</option>
                  <option value="voice">Voz</option>
                </select>
              </div>
              {notificationType === 'voice' && (
                <div className="form-group sm:col-span-1">
                  <label htmlFor="voiceType" className="block text-xs font-medium text-gray-700 dark:text-gray-300">Tipo de Voz</label>
                  <select id="voiceType" className="mt-1 block w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Seleccionar</option>
                    <option value="male">Masculina</option>
                    <option value="female">Femenina</option>
                  </select>
                </div>
              )}
            </div>
            {shouldShowElements && (
              <>
                <hr className="border-gray-400 my-2 mx-auto w-12/12" />
                <div className="p-0 flex justify-end mr-1">
                  <button
                    type="button"
                    className="text-green-500 hover:text-green-400 font-semibold focus:outline-none"
                  >
                    Guardar
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