import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
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

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="3xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Detalles de {title}</ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BarDetailModal;