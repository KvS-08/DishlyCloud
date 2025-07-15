import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Detalle de Utilidad</ModalHeader>
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
                    <Line type="monotone" dataKey="Utilidad" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Detalles de Utilidad:</h3>
                <ul className="list-disc pl-5">
                  {utilityDetails.map((detail, index) => (
                    <li key={index}>Fecha: {detail.date}, Utilidad: ${detail.utility.toFixed(2)}</li>
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

export default UtilityDetailModal;