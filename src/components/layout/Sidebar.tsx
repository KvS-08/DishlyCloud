import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChefHat,
  LogOut
} from 'lucide-react';
import { MdAddBusiness } from 'react-icons/md';
import { IoIosBeer } from 'react-icons/io';
import { HiTicket } from 'react-icons/hi2';

import { TbCashRegister } from 'react-icons/tb';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdTableRestaurant } from 'react-icons/md';
import { FaBoxesPacking, FaChartColumn, FaCircleDollarToSlot } from 'react-icons/fa6';
import { BsFillMenuButtonWideFill } from 'react-icons/bs';
import { useAuth } from '../../hooks/useAuth';
import { useSidebarStore } from '../../stores/sidebarStore';

import { MdDashboardCustomize } from 'react-icons/md';


const NavItem = ({ 
  to, 
  icon: Icon, 
  label, 
  end = false 
}: { 
  to: string; 
  icon: React.ElementType; 
  label: string; 
  end?: boolean;
}) => {
  const { collapsed } = useSidebarStore(() => ({ collapsed: false }));
  
  return (
    <NavLink 
      to={to} 
      end={end}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-3 rounded-md text-base transition-colors
        ${isActive 
          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-200' 
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }
      `}
    >
      <Icon className="h-6 w-6 flex-shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { collapsed } = useSidebarStore(() => ({ collapsed: false }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Get business type based on business name or default to "Restaurante"
  const getBusinessType = () => {
    const businessName = user?.business?.name?.toLowerCase() || '';
    
    if (businessName.includes('café') || businessName.includes('coffee')) {
      return 'Cafetería';
    } else if (businessName.includes('bar') || businessName.includes('cantina')) {
      return 'Bar';
    } else if (businessName.includes('panadería') || businessName.includes('bakery')) {
      return 'Panadería';
    } else if (businessName.includes('pizzería') || businessName.includes('pizza')) {
      return 'Pizzería';
    } else if (businessName.includes('taquería') || businessName.includes('taco')) {
      return 'Taquería';
    } else {
      return 'Restaurante';
    }
  };

  // Determine which menu items to show based on user role
  const renderNavItems = () => {
    if (user?.role?.toLowerCase() === 'master' || user?.role?.toLowerCase() === 'master user') {
      return (
        <>

          <NavItem to="/negocios" icon={MdAddBusiness} label="Negocios" />
          <NavItem to="/tickets" icon={HiTicket} label="Tickets" />
        </>
      );
    } else if (user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'cashier') {
      return (
        <>
          
          <NavItem to="/inicio" icon={MdDashboardCustomize} label="Inicio" />
            <NavItem to="/pos" icon={TbCashRegister} label="POS" />
          <NavItem to="/cuentas" icon={MdTableRestaurant} label="Mesas" />
          <NavItem to="/bar" icon={IoIosBeer} label="Bar" />
          <NavItem to="/kitchen" icon={ChefHat} label="Cocina" />
          <NavItem to="/menu" icon={BsFillMenuButtonWideFill} label="Menú" />
          <NavItem to="/inventory" icon={FaBoxesPacking} label="Inventario" />
          <NavItem to="/reports" icon={FaChartColumn} label="Reportes" />
        </>
      );
    } else if (user?.role?.toLowerCase() === 'waiter') {
      // Mesero role only sees sales and tables
      return (
        <>
          <NavItem to="/sales" icon={FaCircleDollarToSlot} label="Ventas" />
          <NavItem to="/cuentas" icon={MdTableRestaurant} label="Mesas" />
        </>
      );
    } else if (user?.role?.toLowerCase() === 'chef') {
      // Chef role only sees kitchen
      return (
        <>
          <NavItem to="/kitchen" icon={ChefHat} label="Cocina" />
        </>
      );
    } else if (user?.role?.toLowerCase() === 'cashier') {
      // Cashier role sees everything except settings
      return (
        <>

          <NavItem to="/pos" icon={TbCashRegister} label="POS" />
          <NavItem to="/cuentas" icon={MdTableRestaurant} label="Mesas" />
          <NavItem to="/bar" icon={IoIosBeer} label="Bar" />
          <NavItem to="/kitchen" icon={ChefHat} label="Cocina" />
          <NavItem to="/menu" icon={BsFillMenuButtonWideFill} label="Menú" />
          <NavItem to="/inventory" icon={FaBoxesPacking} label="Inventario" />
          <NavItem to="/reports" icon={FaChartColumn} label="Reportes" />
        </>
      );
    } else {
      // Default role (e.g., Admin if not explicitly handled above)
      return (
        <>
          <NavItem to="/pos" icon={TbCashRegister} label="POS" />
          <NavItem to="/cuentas" icon={MdTableRestaurant} label="Mesas" />
          <NavItem to="/bar" icon={IoIosBeer} label="Bar" />
          <NavItem to="/kitchen" icon={ChefHat} label="Cocina" />
          <NavItem to="/menu" icon={BsFillMenuButtonWideFill} label="Menú" />
          <NavItem to="/inventory" icon={FaBoxesPacking} label="Inventario" />
          <NavItem to="/reports" icon={FaChartColumn} label="Reportes" />
        </>
      );
    }
  };

  return (
    <aside className={`
      fixed left-0 top-0 z-20 h-full bg-white border-r border-gray-200 transition-all
      dark:bg-gray-900 dark:border-gray-800 
      w-49 hidden md:block
    `}>
      <div className="flex flex-col h-full">
        <div
          className="relative flex flex-col items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer"
          onClick={toggleDropdown}
          ref={dropdownRef}
        >
          {!collapsed && (
            <div className="flex flex-col items-center space-y-0 w-full mt-1.5">
              <div className="flex items-center space-x-3">
                {user?.business?.logo_url ? (
                  <img 
                    src={user.business.logo_url} 
                    alt="Logo del negocio" 
                    className="h-6 w-6 object-cover rounded-md"
                  />
                ) : (
                  <ChefHat className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                )}
                <h1 className="text-xs font-bold text-gray-600 dark:text-white truncate">
                  {user?.business?.name || 'My Kitchen'}
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center ml-7">
                {getBusinessType()}
              </p>
            </div>
          )}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-30">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.full_name || user?.email} - {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : ''}
                  </p>
              </div>
              <button
                  onClick={signOut}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4" color="red" />
                  <span className="ml-4">Cerrar sesión</span>
                </button>
            </div>
          )}

        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {renderNavItems()}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          {user?.role?.toLowerCase() === 'admin' && (
            <NavItem to="/settings" icon={IoSettingsSharp} label="Opciones" />
          )}
        </div>

      </div>
    </aside>
  );
};