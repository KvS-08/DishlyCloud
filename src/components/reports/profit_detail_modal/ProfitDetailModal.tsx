import React from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProfitDetail {
  date: string;
  profit: number;
}

interface ProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateRange: { start: Date; end: Date };
  filter: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  setFilter: React.Dispatch<React.SetStateAction<'weekly' | 'monthly' | 'quarterly' | 'yearly'>>;
}

const ProfitDetailModal: React.FC<ProfitModalProps> = ({ isOpen, onClose, filter }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  const [profitDetails, setProfitDetails] = useState<ProfitDetail[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching data based on filter
      const fetchData = () => {
        let data: ProfitDetail[] = [];
        if (filter === 'weekly') {
          data = [
            // Removed hardcoded data
          ];
        } else if (filter === 'monthly') {
          data = [
            { date: 'Mon', profit: 1000 },
            { date: 'Tue', profit: 1200 },
            { date: 'Wed', profit: 1100 },
            { date: 'Thu', profit: 1300 },
            { date: 'Fri', profit: 1500 },
            { date: 'Sat', profit: 1700 },
            { date: 'Sun', profit: 1600 },
          ];
        } else if (filter === 'quarterly') {
          data = [
            { date: 'Week 1', profit: 5000 },
            { date: 'Week 2', profit: 5500 },
            { date: 'Week 3', profit: 6000 },
            { date: 'Week 4', profit: 6200 },
          ];
        } else if (filter === 'yearly') {
          data = [
            { date: 'Jan', profit: 20000 },
            { date: 'Feb', profit: 22000 },
            { date: 'Mar', profit: 25000 },
            { date: 'Apr', profit: 23000 },
            { date: 'May', profit: 26000 },
            { date: 'Jun', profit: 28000 },
            { date: 'Jul', profit: 30000 },
            { date: 'Aug', profit: 29000 },
            { date: 'Sep', profit: 31000 },
            { date: 'Oct', profit: 33000 },
            { date: 'Nov', profit: 35000 },
            { date: 'Dec', profit: 38000 },
          ];
        }
        setProfitDetails(data);
        setChartData(data.map(item => ({ ...item, Ganancia: item.profit })));
      };
      fetchData();
    }
  }, [isOpen, filter]);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 dark:text-white">
        <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-gray-400 dark:hover:text-red-500"
          >
            <FaTimes size={20} />
          </button>
        <h2 className="mb-4 text-2xl font-bold dark:text-white">Detalle de Ganancia</h2>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#ffffff' }}
                itemStyle={{ color: '#ffffff' }}
              />
              
              <Line type="monotone" dataKey="Ganancia" stroke="#82ca9d" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold dark:text-white"></h3>
          <ul className="list-disc pl-5 dark:text-gray-300">
            {profitDetails.map((detail, index) => (
              <li key={index}>Fecha: {detail.date}, Ganancia: ${detail.profit.toFixed(2)}</li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return createPortal(modalContent, document.getElementById('modal-root') as HTMLElement);
  } else {
    return null;
  }

};

export default ProfitDetailModal;