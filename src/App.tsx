import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { NotificationsProvider } from './hooks/useNotifications';
import { useThemeStore } from './stores/themeStore';

// Layouts
import { AuthLayout } from './components/auth/AuthLayout';
import { MainLayout } from './components/layout/MainLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import InicioPage from './pages/InicioPage';

import { KitchenPage } from './pages/KitchenPage';
import { BarPage } from './pages/BarPage';
import PosPage from './pages/PosPage';
import OptionsPage from './pages/OptionsPage';
import MenuPage from './pages/MenuPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';

import NegociosPage from './pages/NegociosPage';
import TicketsPage from './pages/TicketsPage';
const MesasPage = React.lazy(() => import('./pages/MesasPage'));
const ReportesPage = React.lazy(() => import('./pages/ReportesPage'));

import MenuQRPage from './pages/MenuQRPage';



import LoadingSpinner from './components/ui/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is Master or Master User, restrict access to only /negocios, and /settings
  if (user.role?.toLowerCase() === 'master' || user.role?.toLowerCase() === 'master user') {
    const masterAllowedPaths = ['/negocios', '/settings', '/tickets', '/cuentas'];
    if (!masterAllowedPaths.includes(location.pathname)) {
      return <Navigate to="/negocios" replace />;
    }
  } else if (user.role?.toLowerCase() === 'waiter') {
    // Mesero role can only access sales and tables pages
    const waiterAllowedPaths = ['/sales', '/cuentas'];
    if (!waiterAllowedPaths.includes(location.pathname)) {
      return <Navigate to="/sales" replace />;
    }
  } else if (user.role?.toLowerCase() === 'chef') {
    // Chef role can only access kitchen page
    if (location.pathname !== '/kitchen') {
      return <Navigate to="/kitchen" replace />;
    }
  } else if (user.role?.toLowerCase() === 'cashier') {
    // Cashier role cannot access settings page
    if (location.pathname === '/settings') {
      return <Navigate to="/pos" replace />;
    }
    
    // For other roles, if allowedRoles are specified, check them
    if (allowedRoles && !allowedRoles.map(role => role.toLowerCase()).includes(user.role?.toLowerCase())) {
      return <Navigate to="/pos" replace />;
    }
  }
  
  return <>{children}</>;
};

// Main App Component
const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const { theme } = useThemeStore();
  const location = useLocation();

  React.useEffect(() => {
    document.title = 'RestaurantOS - Plataforma de Gestión Integral';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const pageVariants = {
    initial: { opacity: 0, y: "-100%" },
    animate: { opacity: 1, y: "0%" },
    exit: { opacity: 0, y: "100%" },
  };

  const pageTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20,
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth Routes */}
        <Route
          path="/"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              {user ? (
                <Navigate to="/inicio" replace />
              ) : (
                <Navigate to="/login" replace />
              )}
            </motion.div>
          }
        />

        <Route
          path="/"
          element={<AuthLayout />}
        >
          <Route
            path="login"
            element={!user ? <LoginPage /> : <Navigate to="/pos" replace />} 
          />
        </Route>

        {/* Master/Master User Specific Routes */}
        <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Cashier']}>
                <NotificationsProvider>
                  <MainLayout />
                </NotificationsProvider>
              </ProtectedRoute>
            }
          >
          <Route
            path="inicio"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <InicioPage />
              </motion.div>
            }
          />
          <Route
            path="negocios"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NegociosPage />
              </motion.div>
            }
          />
          <Route
            path="tickets"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <TicketsPage />
              </motion.div>
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NotificationsProvider>
                <MainLayout />
              </NotificationsProvider>
            </ProtectedRoute>
          }
        >

          <Route
            path="cuentas"
            element={
              <React.Suspense fallback={<LoadingSpinner />}>
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <MesasPage />
                </motion.div>
              </React.Suspense>
            }
          />
          <Route
            path="gastos"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                
              </motion.div>
            }
          />
          <Route
            path="reports"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <ReportesPage />
                </Suspense>
              </motion.div>
            }
          />
          <Route
            path="menu-qr"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <MenuQRPage />
              </motion.div>
            }
          />
          <Route
            path="kitchen"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <KitchenPage />
              </motion.div>
            }
          />
          <Route
            path="bar"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BarPage />
              </motion.div>
            }
          />
          <Route
            path="pos"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <PosPage />
              </motion.div>
            }
          />

          {/* Add placeholder pages for other routes */}
          <Route
            path="accounts"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="p-6"
              >
                <h1 className="text-2xl font-bold">Cuentas (En desarrollo)</h1>
              </motion.div>
            }
          />
          <Route
            path="menu"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <MenuPage />
              </motion.div>
            }
          />
          <Route
            path="inventory"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <InventoryPage />
              </motion.div>
            }
          />
          <Route
            path="inicio"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                
              </motion.div>
            }
          />
          <Route
            path="negocios"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <NegociosPage />
              </motion.div>
            }
          />
          <Route
            path="orders"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="p-6"
              >
                <h1 className="text-2xl font-bold">Órdenes (En desarrollo)</h1>
              </motion.div>
            }
          />
          <Route
            path="settings"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ProtectedRoute allowedRoles={['admin', 'master', 'master user']}>
                  <OptionsPage />
                </ProtectedRoute>
              </motion.div>
            }
          />
          <Route
            path="sales"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <SalesPage />
              </motion.div>
            }
          />
          <Route
            path="businesses"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="p-6"
              >
                <h1 className="text-2xl font-bold">Negocios (En desarrollo)</h1>
              </motion.div>
            }
          />
        </Route>

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <Navigate to="/" replace />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          containerStyle={{ top: 67 }}
          toastOptions={{
            style: {
              fontSize: '0.9rem',
              padding: '7px 4px',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;