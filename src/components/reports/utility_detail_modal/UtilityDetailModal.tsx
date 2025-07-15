import React from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface UtilityDetail {
  date: string;
  utility: number;
}

interface UtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: string;
}

const UtilityDetailModal: React.FC<UtilityModalProps> = ({ isOpen, onClose, filter }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  const [utilityDetails, setUtilityDetails] = useState<UtilityDetail[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching data based on filter
      const fetchData = () => {
        let data: UtilityDetail[] = [];
        if (filter === 'today') {
          data = [
            { date: '08:00', utility: 100 },
            { date: '10:00', utility: 150 },
            { date: '12:00', utility: 200 },
            { date: '14:00', utility: 250 },
            { date: '16:00', utility: 300 },
            { date: '18:00', utility: 350 },
            { date: '20:00', utility: 400 },
            { date: '22:00', utility: 450 },
          ];
        } else if (filter === 'week') {
          data = [
            { date: 'Mon', utility: 800 },
            { date: 'Tue', utility: 900 },
            { date: 'Wed', utility: 850 },
            { date: 'Thu', utility: 950 },
            { date: 'Fri', utility: 1100 },
            { date: 'Sat', utility: 1200 },
            { date: 'Sun', utility: 1150 },
          ];
        } else if (filter === 'month') {
          data = [
            { date: 'Week 1', utility: 4000 },
            { date: 'Week 2', utility: 4200 },
            { date: 'Week 3', utility: 4500 },
            { date: 'Week 4', utility: 4700 },
          ];
        } else if (filter === 'year') {
          data = [
            { date: 'Jan', utility: 18000 },
            { date: 'Feb', utility: 19000 },
            { date: 'Mar', utility: 20000 },
            { date: 'Apr', utility: 19500 },
            { date: 'May', utility: 21000 },
            { date: 'Jun', utility: 22000 },
            { date: 'Jul', utility: 23000 },
            { date: 'Aug', utility: 22500 },
            { date: 'Sep', utility: 24000 },
            { date: 'Oct', utility: 25000 },
            { date: 'Nov', utility: 26000 },
            { date: 'Dec', utility: 27000 },
          ];
        }
        setUtilityDetails(data);
        setChartData(data.map(item => ({ ...item, Utilidad: item.utility })));
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
        <h2 className="mb-4 text-2xl font-bold dark:text-white">Detalle de Utilidad</h2>
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
              
              <Line type="monotone" dataKey="Utilidad" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold dark:text-white"></h3>
          <ul className="list-disc pl-5 dark:text-gray-300">
            {utilityDetails.map((detail, index) => (
              <li key={index}>Fecha: {detail.date}, Utilidad: ${detail.utility.toFixed(2)}</li>
            ))}
          </ul>
        </div>
        <div className="mt-6 flex justify-end">
          
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

export default UtilityDetailModal;