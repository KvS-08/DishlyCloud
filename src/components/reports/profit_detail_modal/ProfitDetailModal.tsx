import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProfitDetail {
  date: string;
  profit: number;
}

interface ProfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: string;
}

const ProfitDetailModal: React.FC<ProfitModalProps> = ({ isOpen, onClose, filter }) => {
  const [profitDetails, setProfitDetails] = useState<ProfitDetail[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching data based on filter
      const fetchData = () => {
        let data: ProfitDetail[] = [];
        if (filter === 'today') {
          data = [
            { date: '08:00', profit: 150 },
            { date: '10:00', profit: 200 },
            { date: '12:00', profit: 250 },
            { date: '14:00', profit: 300 },
            { date: '16:00', profit: 350 },
            { date: '18:00', profit: 400 },
            { date: '20:00', profit: 450 },
            { date: '22:00', profit: 500 },
          ];
        } else if (filter === 'week') {
          data = [
            { date: 'Mon', profit: 1000 },
            { date: 'Tue', profit: 1200 },
            { date: 'Wed', profit: 1100 },
            { date: 'Thu', profit: 1300 },
            { date: 'Fri', profit: 1500 },
            { date: 'Sat', profit: 1700 },
            { date: 'Sun', profit: 1600 },
          ];
        } else if (filter === 'month') {
          data = [
            { date: 'Week 1', profit: 5000 },
            { date: 'Week 2', profit: 5500 },
            { date: 'Week 3', profit: 6000 },
            { date: 'Week 4', profit: 6200 },
          ];
        } else if (filter === 'year') {
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

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Detalle de Ganancia</ModalHeader>
            <ModalBody>
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
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Ganancia" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Detalles de Ganancia:</h3>
                <ul className="list-disc pl-5">
                  {profitDetails.map((detail, index) => (
                    <li key={index}>Fecha: {detail.date}, Ganancia: ${detail.profit.toFixed(2)}</li>
                  ))}
                </ul>
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

export default ProfitDetailModal;