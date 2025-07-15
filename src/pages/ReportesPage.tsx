import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { NotificationBell } from "../components/ui/NotificationBell";
import DateFilter from "../components/ui/DateFilter";
import ErrorBoundary from '../components/ui/ErrorBoundary';
const SalesDetailModal = lazy(() => import('../components/reports/sales_detail_modal/SalesDetailModal'));
const ExpensesDetailModal = lazy(() => import('../components/reports/expenses_detail_modal/ExpensesDetailModal'));
const ProfitDetailModal = lazy(() => import('../components/reports/profit_detail_modal/ProfitDetailModal'));
const UtilityDetailModal = lazy(() => import('../components/reports/utility_detail_modal/UtilityDetailModal'));
const KitchenDetailModal = lazy(() => import('../components/reports/kitchen_detail_modal/KitchenDetailModal'));
const BarDetailModal = lazy(() => import('../components/reports/bar_detail_modal/BarDetailModal'));
import SkeletonCard from '../components/ui/SkeletonCard';

const SalesMetrics = lazy(() => import('../components/reports/SalesMetrics'));

const KitchenMetrics = lazy(() => import('../components/reports/KitchenMetrics'));
const BarMetrics = lazy(() => import('../components/reports/BarMetrics'));

const ReportesPage: React.FC = React.memo(() => {
  const [isSalesDetailModalOpen, setIsSalesDetailModalOpen] = useState(false);
  const [isExpensesDetailModalOpen, setIsExpensesDetailModalOpen] = useState(false);
  const [isProfitDetailModalOpen, setIsProfitDetailModalOpen] = useState(false);
  const [isUtilityDetailModalOpen, setIsUtilityDetailModalOpen] = useState(false);
  const [isKitchenOrdersModalOpen, setIsKitchenOrdersModalOpen] = useState(false);
  const [isKitchenPrepTimeModalOpen, setIsKitchenPrepTimeModalOpen] = useState(false);
  const [isKitchenMostSoldDishModalOpen, setIsKitchenMostSoldDishModalOpen] = useState(false);

  const [isBarOrdersModalOpen, setIsBarOrdersModalOpen] = useState(false);
  const [isBarPrepTimeModalOpen, setIsBarPrepTimeModalOpen] = useState(false);
  const [isBarMostSoldAlcoholModalOpen, setIsBarMostSoldAlcoholModalOpen] = useState(false);
  const [filter, setFilter] = useState('weekly'); // Initialize with a default filter value
  const [salesData, setSalesData] = useState({
    sales: 0,
    expenses: 0,
    utility: 0,
    profit: 0,
    isLoading: true,
  });

  const [barData, setBarData] = useState({
    mostProductiveBartender: 'Cargando...',
    productiveBartenderOrders: 0,
    preparationTime: 'Cargando...',
    mostSoldAlcohol: 'Cargando...',
    isLoading: true,
  });



  const [kitchenData, setKitchenData] = useState({
    productiveChefsData: [],
    preparationTime: 'Cargando...',
    mostSoldDish: 'Cargando...',
    isLoading: true,
  });

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setSalesData({
        sales: 12500.75,
        expenses: 3200.50,
        utility: 9300.25,
        profit: 6100.75,
        isLoading: false,
      });

      setKitchenData({
        productiveChefsData: [
          { name: 'Juan', orders: 75 },
          { name: 'Maria', orders: 60 },
          { name: 'Pedro', orders: 50 },
          { name: 'Ana', orders: 45 },
        ],
        preparationTime: '15 minutos',
        mostSoldDish: 'Pizza Pepperoni',
        isLoading: false,
      });

      setBarData({
        mostProductiveBartender: 'María García',
        productiveBartenderOrders: 50,
        preparationTime: '10 minutos',
        mostSoldAlcohol: 'Cerveza Artesanal',
        isLoading: false,
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className=" space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-lg md:text-3xl font-bold">
          {React.useCallback(() => {
            const date = new Date();
            const options: Intl.DateTimeFormatOptions = {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            };
            
            const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(date);
            return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
          }, [])()}
        </h1>
        <div className="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />

      </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base md:text-xl font-bold">Informe General</h2>
          <DateFilter filter={filter} setFilter={setFilter} />
        </div>
        <ErrorBoundary fallback={<p>Error al cargar las métricas de ventas.</p>}>
          <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
            <SalesMetrics {...salesData} onClick={() => setIsSalesDetailModalOpen(true)} onExpensesClick={() => setIsExpensesDetailModalOpen(true)} onProfitClick={() => setIsProfitDetailModalOpen(true)} onUtilityClick={() => setIsUtilityDetailModalOpen(true)} />
           </Suspense>
         </ErrorBoundary>





      <Suspense fallback={<div>Cargando detalles de ventas...</div>}>
        <SalesDetailModal
          isOpen={isSalesDetailModalOpen}
          onClose={() => setIsSalesDetailModalOpen(false)}
          dateRange={(() => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday of current week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return { start: startOfWeek, end: endOfWeek };
          })()} // Pass actual date range if available
          filter={filter as "weekly" | "monthly" | "quarterly" | "yearly"}
          // Remove setFilter prop since it's not defined in SalesModalProps interface
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de gastos...</div>}>
        <ExpensesDetailModal
          isOpen={isExpensesDetailModalOpen}
          onClose={() => setIsExpensesDetailModalOpen(false)}
          dateRange={(() => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday of current week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return { start: startOfWeek, end: endOfWeek };
          })()} // Pass actual date range if available
          filter={filter as "weekly" | "monthly" | "quarterly" | "yearly"}
          setFilter={setFilter}
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de ganancias...</div>}>
        <ProfitDetailModal
          isOpen={isProfitDetailModalOpen}
          onClose={() => setIsProfitDetailModalOpen(false)}
          dateRange={(() => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday of current week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return { start: startOfWeek, end: endOfWeek };
          })()} // Pass actual date range if available
          filter={filter}
          setFilter={setFilter}
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de utilidad...</div>}>
        <UtilityDetailModal
          isOpen={isUtilityDetailModalOpen}
          onClose={() => setIsUtilityDetailModalOpen(false)}
          dateRange={(() => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday of current week
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return { start: startOfWeek, end: endOfWeek };
          })()} // Pass actual date range if available
          filter={filter}
          setFilter={setFilter}
        />
      </Suspense>

      <h2 className="text-base md:text-xl font-bold mt-8 mb-4">Informe de Cocina</h2>
      <ErrorBoundary fallback={<p>Error al cargar las métricas de cocina.</p>}>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>}>
          <KitchenMetrics
            productiveChefsData={kitchenData.productiveChefsData}
            preparationTime={kitchenData.preparationTime}
            mostSoldDish={kitchenData.mostSoldDish}
            isLoading={kitchenData.isLoading}
            onOrdersClick={() => setIsKitchenOrdersModalOpen(true)}
            onPrepTimeClick={() => setIsKitchenPrepTimeModalOpen(true)}
            onMostSoldDishClick={() => setIsKitchenMostSoldDishModalOpen(true)}
            filter={filter}
          />
        </Suspense>
      </ErrorBoundary>

      <Suspense fallback={<div>Cargando detalles de órdenes de cocina...</div>}>
        <KitchenDetailModal
          isOpen={isKitchenOrdersModalOpen}
          onClose={() => setIsKitchenOrdersModalOpen(false)}
        />
      </Suspense>





      <Suspense fallback={<div>Cargando detalles de tiempo de preparación de cocina...</div>}>
        <KitchenDetailModal
          isOpen={isKitchenPrepTimeModalOpen}
          onClose={() => setIsKitchenPrepTimeModalOpen(false)}
          filter={filter}
          title="Tiempo de Preparación"
          dataKey="Tiempo de Preparación"
          chartColor="#82ca9d"
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de plato más vendido de cocina...</div>}>
        <KitchenDetailModal
          isOpen={isKitchenMostSoldDishModalOpen}
          onClose={() => setIsKitchenMostSoldDishModalOpen(false)}
          filter={filter}
          title="Plato Más Vendido"
          dataKey="Plato Más Vendido"
          chartColor="#ffc658"
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de órdenes de bar...</div>}>
        <BarDetailModal
          isOpen={isBarOrdersModalOpen}
          onClose={() => setIsBarOrdersModalOpen(false)}
          filter={filter}
          title="Órdenes Atendidas"
          dataKey="Órdenes Atendidas"
          chartColor="#8884d8"
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de tiempo de preparación de bar...</div>}>
        <BarDetailModal
          isOpen={isBarPrepTimeModalOpen}
          onClose={() => setIsBarPrepTimeModalOpen(false)}
          filter={filter}
          title="Tiempo de Preparación"
          dataKey="Tiempo de Preparación"
          chartColor="#82ca9d"
        />
      </Suspense>

      <Suspense fallback={<div>Cargando detalles de alcohol más vendido de bar...</div>}>
        <BarDetailModal
          isOpen={isBarMostSoldAlcoholModalOpen}
          onClose={() => setIsBarMostSoldAlcoholModalOpen(false)}
          filter={filter}
          title="Alcohol Más Vendido"
          dataKey="Alcohol Más Vendido"
          chartColor="#ffc658"
        />
      </Suspense>

        <div className="mt-6">
          <h2 className="text-base md:text-xl font-bold mb-2">Informe del Bar</h2>
          <ErrorBoundary fallback={<p>Error al cargar el informe del bar.</p>}>
            <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>}>
              <BarMetrics {...barData} />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
});

export default ReportesPage;