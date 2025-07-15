import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KitchenDetail {
  date: string;
  value: number;
}

interface KitchenModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: string;
  title: string;
  dataKey: string;
  chartColor: string;
}

const KitchenDetailModal: React.FC<KitchenModalProps> = ({ isOpen, onClose, filter, title, dataKey, chartColor }) => {
  const [kitchenDetails, setKitchenDetails] = useState<KitchenDetail[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Simulate fetching data based on filter and dataKey
      const fetchData = () => {
        let data: KitchenDetail[] = [];
        // This is placeholder data. In a real application, you would fetch this from an API.
        if (dataKey === 'Órdenes Atendidas') {
          if (filter === 'today') {
            data = [
              { date: '08:00', value: 5 },
              { date: '10:00', value: 8 },
              { date: '12:00', value: 12 },
              { date: '14:00', value: 10 },
              { date: '16:00', value: 15 },
              { date: '18:00', value: 18 },
              { date: '20:00', value: 20 },
              { date: '22:00', value: 17 },
            ];
          } else if (filter === 'week') {
            data = [
              { date: 'Mon', value: 50 },
              { date: 'Tue', value: 60 },
              { date: 'Wed', value: 55 },
              { date: 'Thu', value: 70 },
              { date: 'Fri', value: 80 },
              { date: 'Sat', value: 90 },
              { date: 'Sun', value: 75 },
            ];
          } else if (filter === 'month') {
            data = [
              { date: 'Week 1', value: 200 },
              { date: 'Week 2', value: 220 },
              { date: 'Week 3', value: 250 },
              { date: 'Week 4', value: 230 },
            ];
          } else if (filter === 'year') {
            data = [
              { date: 'Jan', value: 800 },
              { date: 'Feb', value: 850 },
              { date: 'Mar', value: 900 },
              { date: 'Apr', value: 880 },
              { date: 'May', value: 950 },
              { date: 'Jun', value: 1000 },
              { date: 'Jul', value: 1100 },
              { date: 'Aug', value: 1050 },
              { date: 'Sep', value: 1150 },
              { date: 'Oct', value: 1200 },
              { date: 'Nov', value: 1250 },
              { date: 'Dec', value: 1300 },
            ];
          }
        } else if (dataKey === 'Tiempo de Preparación') {
            if (filter === 'today') {
                data = [
                  { date: '08:00', value: 10 },
                  { date: '10:00', value: 12 },
                  { date: '12:00', value: 9 },
                  { date: '14:00', value: 11 },
                  { date: '16:00', value: 13 },
                  { date: '18:00', value: 10 },
                  { date: '20:00', value: 8 },
                  { date: '22:00', value: 9 },
                ];
              } else if (filter === 'week') {
                data = [
                  { date: 'Mon', value: 11 },
                  { date: 'Tue', value: 10 },
                  { date: 'Wed', value: 12 },
                  { date: 'Thu', value: 9 },
                  { date: 'Fri', value: 10 },
                  { date: 'Sat', value: 8 },
                  { date: 'Sun', value: 9 },
                ];
              } else if (filter === 'month') {
                data = [
                  { date: 'Week 1', value: 10 },
                  { date: 'Week 2', value: 11 },
                  { date: 'Week 3', value: 9 },
                  { date: 'Week 4', value: 10 },
                ];
              } else if (filter === 'year') {
                data = [
                  { date: 'Jan', value: 10 },
                  { date: 'Feb', value: 11 },
                  { date: 'Mar', value: 10 },
                  { date: 'Apr', value: 9 },
                  { date: 'May', value: 10 },
                  { date: 'Jun', value: 11 },
                  { date: 'Jul', value: 10 },
                  { date: 'Aug', value: 9 },
                  { date: 'Sep', value: 10 },
                  { date: 'Oct', value: 11 },
                  { date: 'Nov', value: 10 },
                  { date: 'Dec', value: 9 },
                ];
              }
        } else if (dataKey === 'Plato Más Vendido') {
            if (filter === 'today') {
                data = [
                  { date: '08:00', value: 3 },
                  { date: '10:00', value: 5 },
                  { date: '12:00', value: 7 },
                  { date: '14:00', value: 6 },
                  { date: '16:00', value: 8 },
                  { date: '18:00', value: 9 },
                  { date: '20:00', value: 10 },
                  { date: '22:00', value: 8 },
                ];
              } else if (filter === 'week') {
                data = [
                  { date: 'Mon', value: 20 },
                  { date: 'Tue', value: 25 },
                  { date: 'Wed', value: 22 },
                  { date: 'Thu', value: 28 },
                  { date: 'Fri', value: 30 },
                  { date: 'Sat', value: 35 },
                  { date: 'Sun', value: 28 },
                ];
              } else if (filter === 'month') {
                data = [
                  { date: 'Week 1', value: 100 },
                  { date: 'Week 2', value: 110 },
                  { date: 'Week 3', value: 120 },
                  { date: 'Week 4', value: 115 },
                ];
              } else if (filter === 'year') {
                data = [
                  { date: 'Jan', value: 400 },
                  { date: 'Feb', value: 420 },
                  { date: 'Mar', value: 450 },
                  { date: 'Apr', value: 430 },
                  { date: 'May', value: 480 },
                  { date: 'Jun', value: 500 },
                  { date: 'Jul', value: 550 },
                  { date: 'Aug', value: 520 },
                  { date: 'Sep', value: 580 },
                  { date: 'Oct', value: 600 },
                  { date: 'Nov', value: 620 },
                  { date: 'Dec', value: 650 },
                ];
              }
        }
        setKitchenDetails(data);
        setChartData(data.map(item => ({ ...item, [dataKey]: item.value })));
      };
      fetchData();
    }
  }, [isOpen, filter, dataKey]);

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
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
                    <Line type="monotone" dataKey={dataKey} stroke={chartColor} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Detalles de {title.toLowerCase()}:</h3>
                <ul className="list-disc pl-5">
                  {kitchenDetails.map((detail, index) => (
                    <li key={index}>Fecha: {detail.date}, {dataKey}: {detail.value}</li>
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

export default KitchenDetailModal;