import React, { useState, useEffect } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import { NotificationBell } from '../components/ui/NotificationBell';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useBusinessSettings } from '../hooks/useBusinessSettings';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FaChartLine, FaChartBar, FaChartPie, FaUserClock, FaUsers } from 'react-icons/fa';
import { GiReceiveMoney, GiMoneyStack } from 'react-icons/gi';
import { MdRestaurantMenu } from 'react-icons/md';
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { PiBowlFoodFill } from "react-icons/pi";
import { MdTimer } from "react-icons/md";
import { IoTicketSharp } from 'react-icons/io5';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define report types
type ReportType = 'sales' | 'expenses' | 'products' | 'cashier' | 'employees' | 'orders';
type TimeRange = 'week' | 'month' | 'quarter' | 'year';

const ReportesPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useBusinessSettings();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 })
  });

  // Data states
  const [salesData, setSalesData] = useState<any>({
    labels: [],
    datasets: []
  });
  const [expensesData, setExpensesData] = useState<any>({
    line: {
      labels: [],
      datasets: []
    },
    pie: {
      labels: [],
      datasets: []
    }
  });
  const [productsData, setProductsData] = useState<any>({
    labels: [],
    datasets: []
  });
  const [cashierData, setCashierData] = useState<any>({
    labels: [],
    datasets: []
  });
  const [employeesData, setEmployeesData] = useState<any>({
    labels: [],
    datasets: []
  });
  const [ordersData, setOrdersData] = useState<any>({
    line: {
      labels: [],
      datasets: []
    },
    pie: {
      labels: [],
      datasets: []
    }
  });

  // Summary metrics
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalSales: 0,
    totalExpenses: 0,
    totalOrders: 0,
    averageTicket: 0,
    topProduct: '',
    topProductSales: 0,
    topEmployee: '',
    topEmployeeSales: 0
  });

  // Update date range when time range changes
  useEffect(() => {
    const today = new Date();
    let start, end;

    switch (timeRange) {
      case 'week':
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'quarter':
        start = startOfQuarter(today);
        end = endOfQuarter(today);
        break;
      case 'year':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      default:
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
    }

    setDateRange({ start, end });
  }, [timeRange]);

  // Fetch data when date range or report type changes
  useEffect(() => {
    if (user?.business_id) {
      fetchReportData();
    }
  }, [dateRange, reportType, user?.business_id]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      switch (reportType) {
        case 'sales':
          await fetchSalesData();
          break;
        case 'expenses':
          await fetchExpensesData();
          break;
        case 'products':
          await fetchProductsData();
          break;
        case 'cashier':
          await fetchCashierData();
          break;
        case 'employees':
          await fetchEmployeesData();
          break;
        case 'utileria':
          await fetchOrdersData();
          break;
      }
      await fetchSummaryMetrics();
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data, error } = await supabase
        .from('ventas')
        .select('fecha, valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha');

      if (error) {
        console.error('Error fetching sales data:', error);
        return;
      }

      // Process data for chart
      const groupedData = groupDataByDate(data || [], timeRange);
      
      setSalesData({
        labels: Object.keys(groupedData),
        datasets: [
          {
            label: 'Ventas',
            data: Object.values(groupedData),
            borderColor: '#0d9488',
            backgroundColor: 'rgba(13, 148, 136, 0.1)',
            fill: true,
            tension: 0.4,
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchExpensesData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data, error } = await supabase
        .from('gastos')
        .select('fecha, valor, tipo')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha');

      if (error) {
        console.error('Error fetching expenses data:', error);
        return;
      }

      // Process data for chart
      const groupedData = groupDataByDate(data || [], timeRange);
      
      // Also group by expense type for pie chart
      const expensesByType: Record<string, number> = {};
      (data || []).forEach(expense => {
        const type = expense.tipo || 'Sin categoría';
        expensesByType[type] = (expensesByType[type] || 0) + expense.valor;
      });

      setExpensesData({
        // Line chart data
        line: {
          labels: Object.keys(groupedData),
          datasets: [
            {
              label: 'Gastos',
              data: Object.values(groupedData),
              borderColor: '#ef4444',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        },
        // Pie chart data
        pie: {
          labels: Object.keys(expensesByType),
          datasets: [
            {
              data: Object.values(expensesByType),
              backgroundColor: [
                '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
                '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
              ],
              borderWidth: 1
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching expenses data:', error);
    }
  };

  const fetchProductsData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data, error } = await supabase
        .from('ventas')
        .select('producto, valor, fecha')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (error) {
        console.error('Error fetching products data:', error);
        return;
      }

      // Process data to count occurrences and total amount for each product
      const productStats: Record<string, { count: number; amount: number }> = {};
      
      (data || []).forEach(item => {
        // Extract product name and quantity from the format "Product Name x2"
        const match = item.producto.match(/^(.+) x(\d+)$/);
        if (match) {
          const productName = match[1];
          const quantity = parseInt(match[2]);
          
          if (!productStats[productName]) {
            productStats[productName] = { count: 0, amount: 0 };
          }
          
          productStats[productName].count += quantity;
          productStats[productName].amount += item.valor;
        }
      });

      // Sort products by count and get top 10
      const topProducts = Object.entries(productStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10);

      setProductsData({
        labels: topProducts.map(([name]) => name),
        datasets: [
          {
            label: 'Cantidad vendida',
            data: topProducts.map(([, stats]) => stats.count),
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            borderWidth: 1
          },
          {
            label: 'Ventas (L.)',
            data: topProducts.map(([, stats]) => stats.amount),
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching products data:', error);
    }
  };

  const fetchCashierData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      const { data, error } = await supabase
        .from('aperturas')
        .select('*')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate)
        .order('fecha');

      if (error) {
        console.error('Error fetching cashier data:', error);
        return;
      }

      // Process data for chart
      const openings = data || [];
      const labels = openings.map(opening => format(new Date(opening.fecha), 'dd/MM/yyyy'));
      const openingAmounts = openings.map(opening => opening.efectivo_apertura || 0);
      const closingAmounts = openings.map(opening => opening.efectivo_cierre || 0);
      const salesAmounts = openings.map(opening => opening.venta_total || 0);
      const expensesAmounts = openings.map(opening => opening.gastos || 0);
      const profitAmounts = openings.map(opening => opening.utilidad || 0);

      setCashierData({
        labels,
        datasets: [
          {
            label: 'Efectivo Apertura',
            data: openingAmounts,
            backgroundColor: '#3b82f6',
            borderColor: '#2563eb',
            borderWidth: 1
          },
          {
            label: 'Efectivo Cierre',
            data: closingAmounts,
            backgroundColor: '#8b5cf6',
            borderColor: '#7c3aed',
            borderWidth: 1
          },
          {
            label: 'Ventas',
            data: salesAmounts,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Gastos',
            data: expensesAmounts,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1
          },
          {
            label: 'Utilidad',
            data: profitAmounts,
            backgroundColor: '#f59e0b',
            borderColor: '#d97706',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching cashier data:', error);
    }
  };

  const fetchEmployeesData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch sales by employee (cashier)
      const { data: salesData, error: salesError } = await supabase
        .from('ventas')
        .select('cajero, valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (salesError) {
        console.error('Error fetching employee sales data:', salesError);
        return;
      }

      // Fetch expenses by employee
      const { data: expensesData, error: expensesError } = await supabase
        .from('gastos')
        .select('created_by, valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (expensesError) {
        console.error('Error fetching employee expenses data:', expensesError);
        return;
      }

      // Fetch users to map created_by IDs to names
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('business_id', user.business_id);

      if (usersError) {
        console.error('Error fetching users data:', usersError);
        return;
      }

      // Create a map of user IDs to names
      const userMap = new Map();
      (usersData || []).forEach(user => {
        userMap.set(user.id, user.full_name);
      });

      // Process sales data by cashier
      const salesByEmployee: Record<string, number> = {};
      (salesData || []).forEach(sale => {
        const employee = sale.cajero;
        salesByEmployee[employee] = (salesByEmployee[employee] || 0) + sale.valor;
      });

      // Process expenses data by employee
      const expensesByEmployee: Record<string, number> = {};
      (expensesData || []).forEach(expense => {
        const employeeId = expense.created_by;
        const employeeName = userMap.get(employeeId) || 'Unknown';
        expensesByEmployee[employeeName] = (expensesByEmployee[employeeName] || 0) + expense.valor;
      });

      // Combine data for chart
      const allEmployees = new Set([
        ...Object.keys(salesByEmployee),
        ...Object.keys(expensesByEmployee)
      ]);

      const labels = Array.from(allEmployees);
      const salesValues = labels.map(employee => salesByEmployee[employee] || 0);
      const expensesValues = labels.map(employee => expensesByEmployee[employee] || 0);

      setEmployeesData({
        labels,
        datasets: [
          {
            label: 'Ventas',
            data: salesValues,
            backgroundColor: '#10b981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Gastos',
            data: expensesValues,
            backgroundColor: '#ef4444',
            borderColor: '#dc2626',
            borderWidth: 1
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching employees data:', error);
    }
  };

  const fetchOrdersData = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch orders
      const { data, error } = await supabase
        .from('ventas')
        .select('fecha, numero_orden, tipo_orden, estado')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (error) {
        console.error('Error fetching orders data:', error);
        return;
      }

      // Group orders by date
      const ordersByDate: Record<string, { total: number; completed: number; pending: number }> = {};
      
      (data || []).forEach(order => {
        const date = format(new Date(order.fecha), timeRange === 'week' ? 'EEE' : 'dd/MM', { locale: es });
        
        if (!ordersByDate[date]) {
          ordersByDate[date] = { total: 0, completed: 0, pending: 0 };
        }
        
        // Count unique orders by numero_orden
        const isNewOrder = !Object.values(ordersByDate[date]).some(
          (_, idx, arr) => idx > 0 && arr[idx - 1] === order.numero_orden
        );
        
        if (isNewOrder) {
          ordersByDate[date].total += 1;
          
          if (order.estado === 'pagado' || order.estado === 'completada') {
            ordersByDate[date].completed += 1;
          } else {
            ordersByDate[date].pending += 1;
          }
        }
      });

      // Prepare data for chart
      const labels = Object.keys(ordersByDate);
      const totalOrders = labels.map(date => ordersByDate[date].total);
      const completedOrders = labels.map(date => ordersByDate[date].completed);
      const pendingOrders = labels.map(date => ordersByDate[date].pending);

      // Also group by order type for pie chart
      const ordersByType: Record<string, number> = {};
      (data || []).forEach(order => {
        const type = order.tipo_orden || 'Sin tipo';
        ordersByType[type] = (ordersByType[type] || 0) + 1;
      });

      setOrdersData({
        // Line chart data
        line: {
          labels,
          datasets: [
            {
              label: 'Total Órdenes',
              data: totalOrders,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Completadas',
              data: completedOrders,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Pendientes',
              data: pendingOrders,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: true,
              tension: 0.4,
            }
          ]
        },
        // Pie chart data
        pie: {
          labels: Object.keys(ordersByType),
          datasets: [
            {
              data: Object.values(ordersByType),
              backgroundColor: [
                '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
                '#ec4899', '#06b6d4', '#14b8a6', '#84cc16', '#a855f7'
              ],
              borderWidth: 1
            }
          ]
        }
      });
    } catch (error) {
      console.error('Error fetching orders data:', error);
    }
  };

  const fetchSummaryMetrics = async () => {
    if (!user?.business_id) return;

    try {
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();

      // Fetch total sales
      const { data: salesData, error: salesError } = await supabase
        .from('ventas')
        .select('valor, numero_orden')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (salesError) {
        console.error('Error fetching summary sales data:', salesError);
        return;
      }

      // Fetch total expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('gastos')
        .select('valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (expensesError) {
        console.error('Error fetching summary expenses data:', expensesError);
        return;
      }

      // Fetch top products
      const { data: productsData, error: productsError } = await supabase
        .from('ventas')
        .select('producto, valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (productsError) {
        console.error('Error fetching summary products data:', productsError);
        return;
      }

      // Fetch top employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('ventas')
        .select('cajero, valor')
        .eq('business_id', user.business_id)
        .gte('fecha', startDate)
        .lte('fecha', endDate);

      if (employeesError) {
        console.error('Error fetching summary employees data:', employeesError);
        return;
      }

      // Calculate total sales
      const totalSales = (salesData || []).reduce((sum, item) => sum + item.valor, 0);

      // Calculate total expenses
      const totalExpenses = (expensesData || []).reduce((sum, item) => sum + item.valor, 0);

      // Calculate total orders (unique by numero_orden)
      const uniqueOrders = new Set((salesData || []).map(item => item.numero_orden));
      const totalOrders = uniqueOrders.size;

      // Calculate average ticket
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Find top product
      const productStats: Record<string, { count: number; amount: number }> = {};
      (productsData || []).forEach(item => {
        const match = item.producto.match(/^(.+) x(\d+)$/);
        if (match) {
          const productName = match[1];
          const quantity = parseInt(match[2]);
          
          if (!productStats[productName]) {
            productStats[productName] = { count: 0, amount: 0 };
          }
          
          productStats[productName].count += quantity;
          productStats[productName].amount += item.valor;
        }
      });

      let topProduct = '';
      let topProductSales = 0;
      
      Object.entries(productStats).forEach(([name, stats]) => {
        if (stats.amount > topProductSales) {
          topProduct = name;
          topProductSales = stats.amount;
        }
      });

      // Find top employee
      const employeeStats: Record<string, number> = {};
      (employeesData || []).forEach(item => {
        const employee = item.cajero;
        employeeStats[employee] = (employeeStats[employee] || 0) + item.valor;
      });

      let topEmployee = '';
      let topEmployeeSales = 0;
      
      Object.entries(employeeStats).forEach(([name, sales]) => {
        if (sales > topEmployeeSales) {
          topEmployee = name;
          topEmployeeSales = sales;
        }
      });

      // Update summary metrics
      setSummaryMetrics({
        totalSales,
        totalExpenses,
        totalOrders,
        averageTicket,
        topProduct,
        topProductSales,
        topEmployee,
        topEmployeeSales
      });
    } catch (error) {
      console.error('Error fetching summary metrics:', error);
    }
  };

  // Helper function to group data by date
  const groupDataByDate = (data: any[], timeRange: TimeRange) => {
    const groupedData: Record<string, number> = {};
    
    data.forEach(item => {
      let dateKey;
      const date = new Date(item.fecha);
      
      switch (timeRange) {
        case 'week':
          dateKey = format(date, 'EEE', { locale: es }); // Mon, Tue, etc.
          break;
        case 'month':
          dateKey = format(date, 'dd', { locale: es }); // 01, 02, etc.
          break;
        case 'quarter':
          dateKey = format(date, 'MMM', { locale: es }); // Jan, Feb, etc.
          break;
        case 'year':
          dateKey = format(date, 'MMM', { locale: es }); // Jan, Feb, etc.
          break;
        default:
          dateKey = format(date, 'dd/MM', { locale: es });
      }
      
      groupedData[dateKey] = (groupedData[dateKey] || 0) + item.valor;
    });
    
    return groupedData;
  };

  const formatCurrency = (amount: number) => {
    const currency = settings?.currency || 'HNL';
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Ventas')) {
                return label + formatCurrency(context.parsed.y);
              } else {
                return label + context.parsed.y;
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Ventas (L.)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${formatCurrency(value)})`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 md:ml-32 pt-4 md:pt-0 md:-mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-3xl font-bold">
          {(() => {
            const formattedDate = format(new Date(), 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es });
            const parts = formattedDate.split(',');
            if (parts.length > 0) {
              const day = parts[0];
              const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
              return [capitalizedDay, ...parts.slice(1)].join(',');
            }
            return formattedDate;
          })()}
        </h1>
        <div className="hidden md:flex items-center space-x-0">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
        <div className="flex flex-col-3 md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              Reportes
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="px-0 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24 md:w-40"
            >
              <option value="sales">Ventas</option>
              <option value="expenses">Gastos</option>
              <option value="products">Productos</option>
              <option value="cashier">Aperturas y Cierres</option>
              <option value="employees">Empleados</option>
              <option value="utileria">Utileria</option>
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-0.5 py-1 text-sm border border-gray-300 rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white w-24 md:w-28"
            >
              <option value="week">Semanal</option>
              <option value="month">Mensual</option>
              <option value="quarter">Trimestral</option>
              <option value="year">Anual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ventas</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryMetrics.totalSales)}</p>
            </div>
            <div className="p-1 rounded-md bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <FaCircleDollarToSlot className="h-5 w-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Gastos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryMetrics.totalExpenses)}</p>
            </div>
            <div className="p-1 rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <FaCircleDollarToSlot className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Utileria</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryMetrics.totalUtileria}</p>
            </div>
            <div className="p-1 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <GiReceiveMoney className="h-5 w-5" />
              </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ganancia</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(summaryMetrics.averageTicket)}</p>
            </div>
            <div className="p-1 rounded-md bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <GiMoneyStack className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Ordenes Atendidas</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryMetrics.totalOrders || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400"></p>
            </div>
            <div className="p-1 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <IoTicketSharp className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Tiempo de preparación</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryMetrics.topEmployee || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400"></p>
            </div>
            <div className="p-1 rounded-md bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
              <MdTimer className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Producto Más Vendido</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{summaryMetrics.topProduct || 'N/A'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400"></p>
            </div>
            <div className="p-1 rounded-md bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <PiBowlFoodFill className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Report Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          {reportType === 'sales' && <><FaChartLine className="mr-2 text-green-500" /> Reporte de Ventas</>}
          {reportType === 'expenses' && <><FaChartLine className="mr-2 text-red-500" /> Reporte de Gastos</>}
          {reportType === 'products' && <><FaChartBar className="mr-2 text-blue-500" /> Reporte de Productos</>}
          {reportType === 'cashier' && <><FaChartBar className="mr-2 text-purple-500" /> Reporte de Aperturas y Cierres</>}
          {reportType === 'employees' && <><FaChartBar className="mr-2 text-teal-500" /> Métricas de Empleados</>}
          {reportType === 'utileria' && <><FaChartLine className="mr-2 text-orange-500" /> Reporte de Utileria</>}
        </h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-64 md:h-80">
            {reportType === 'sales' && (
              <Line data={salesData} options={lineChartOptions} />
            )}
            
            {reportType === 'expenses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">
                  <Line data={expensesData.line} options={lineChartOptions} />
                </div>
                <div className="h-64">
                  <Pie data={expensesData.pie} options={pieChartOptions} />
                </div>
              </div>
            )}
            
            {reportType === 'products' && (
              <Bar data={productsData} options={barChartOptions} />
            )}
            
            {reportType === 'cashier' && (
              <Bar data={cashierData} options={{
                ...barChartOptions,
                scales: {
                  ...barChartOptions.scales,
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }} />
            )}
            
            {reportType === 'employees' && (
              <Bar data={employeesData} options={{
                ...barChartOptions,
                scales: {
                  ...barChartOptions.scales,
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }} />
            )}
            
            {reportType === 'utileria' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64">
                  <Line data={ordersData.line} options={{
                    ...lineChartOptions,
                    scales: {
                      ...lineChartOptions.scales,
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value: any) {
                            return value;
                          }
                        }
                      }
                    }
                  }} />
                </div>
                <div className="h-64">
                  <Pie data={ordersData.pie} options={{
                    ...pieChartOptions,
                    plugins: {
                      ...pieChartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          label: function(context: any) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${percentage}% (${value} órdenes)`;
                          }
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Additional Metrics Section */}
      {reportType === 'employees' && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FaUserClock className="mr-2 text-indigo-500" /> Métricas de Tiempo de Servicio
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Empleado</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Órdenes Atendidas</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tiempo Promedio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Juan Pérez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Cocinero</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">42</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">15 min</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">María López</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Cocinero</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">38</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">18 min</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Carlos Rodríguez</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Mesero</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">56</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">5 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;