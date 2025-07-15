import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarDetail {
  date: string;
  value: number;
}

interface BarModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: string;
  title: string;
  dataKey: string;
  chartColor: string;
}

const BarDetailModal: React.FC<BarModalProps> = ({ isOpen, onClose, filter, title, dataKey, chartColor }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);
  const [barDetails, setBarDetails] = useState<BarDetail[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching data based on filter and dataKey
      const fetchData = () => {
        let data: BarDetail[] = [];
        if (filter === 'daily') {
          data = [
            { date: '2023-01-01', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-02', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-03', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-04', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-05', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-06', value: Math.floor(Math.random() * 100) },
            { date: '2023-01-07', value: Math.floor(Math.random() * 100) },
          ];
        } else if (filter === 'weekly') {
          data = [
            { date: 'Week 1', value: Math.floor(Math.random() * 500) },
            { date: 'Week 2', value: Math.floor(Math.random() * 500) },
            { date: 'Week 3', value: Math.floor(Math.random() * 500) },
            { date: 'Week 4', value: Math.floor(Math.random() * 500) },
          ];
        } else if (filter === 'monthly') {
          data = [
            { date: 'Jan', value: Math.floor(Math.random() * 2000) },
            { date: 'Feb', value: Math.floor(Math.random() * 2000) },
            { date: 'Mar', value: Math.floor(Math.random() * 2000) },
            { date: 'Apr', value: Math.floor(Math.random() * 2000) },
            { date: 'May', value: Math.floor(Math.random() * 2000) },
            { date: 'Jun', value: Math.floor(Math.random() * 2000) },
          ];
        }
        setBarDetails(data);
      };

      fetchData();
    }
  }, [isOpen, filter, dataKey]);

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-11/12 max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <FaTimes size={24} />
        </button>
        <h2 className="mb-4 text-2xl font-bold">Detalles de {title}</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={barDetails}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke={chartColor} activeDot={{ r: 8 }} name={dataKey} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            Cerrar
          </button>
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

export default BarDetailModal;