import { Clock, Check } from 'lucide-react';
import { IoMdTrash } from 'react-icons/io';
import { FaCheckCircle } from 'react-icons/fa';
import { formatDistance, formatDistanceStrict } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  preparationTime: number;
  notes?: {
    con: string;
    sin: string;
  };
}

interface BarOrderCardProps {
  id: string;
  orderNumber: number;
  customerName?: string;
  tableNumber?: string;
  items: OrderItem[];
  createdAt: Date;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
}

export const BarOrderCard: React.FC<BarOrderCardProps> = ({
  id,
  orderNumber,
  customerName,
  tableNumber,
  items,
  createdAt,
  onComplete,
  onCancel,
}) => {
  const [now, setNow] = useState(new Date());
  
  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate the total preparation time (max of all items)
  const totalPrepTime = Math.max(...items.map(item => item.preparationTime * 60 * 1000));
  
  // Calculate elapsed time
  const elapsedMs = now.getTime() - createdAt.getTime();
  const elapsedPercentage = (elapsedMs / totalPrepTime) * 100;
  
  // Determine color based on elapsed percentage
  let colorClass = 'bg-success-100 border-success-500 text-success-800 dark:bg-success-900/30 dark:border-success-700 dark:text-success-400';
  let statusText = 'A tiempo';
  
  if (elapsedPercentage >= 70 && elapsedPercentage < 100) {
    colorClass = 'bg-warning-100 border-warning-500 text-warning-800 dark:bg-warning-900/30 dark:border-warning-700 dark:text-warning-400 pulse-alert';
    statusText = 'Atención';
  } else if (elapsedPercentage >= 100) {
    colorClass = 'bg-danger-100 border-danger-500 text-danger-800 dark:bg-danger-900/30 dark:border-danger-700 dark:text-danger-400 pulse-alert';
    statusText = 'Alerta';
  }
  
  const timeLeft = totalPrepTime - elapsedMs;
  const formattedTimeLeft = timeLeft > 0 
    ? formatDistance(0, timeLeft, { includeSeconds: true, locale: es }).replace('minutos', 'min')
    : 'Retrasado';
  
  // Determine the title based on table number or customer name
  const orderTitle = tableNumber 
    ? `${tableNumber} - #${orderNumber}` 
    : customerName 
      ? `${customerName} - #${orderNumber}` 
      : `Orden para llevar - #${orderNumber}`;
  
  return (
    <div className={`rounded-lg border-l-4 p-4 shadow-md transition-all ${colorClass}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm md:text-base">
            {orderTitle}
          </h3>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4 hidden sm:block" />
            <span className="text-xs sm:text-xs font-medium hidden sm:block">
              {statusText}: {formattedTimeLeft}
            </span>
          </div>
          <p className="text-xs sm:text-xs opacity-75 hidden sm:block">
            Recibida: {formatDistanceStrict(createdAt, now, { addSuffix: true, locale: es }).replace('minutos', 'min')}
          </p>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0">
            <div className="flex justify-between items-center">
              <span className="font-medium text-xs sm:text-sm">
                {item.name} x{item.quantity}
              </span>
              <span className="text-xs sm:text-xs hidden sm:block">
                {item.preparationTime} min
              </span>
            </div>
            
            {/* Notes section */}
            {item.notes && (item.notes.con || item.notes.sin) && (
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {item.notes.con && (
                  <div>
                    <span className="font-medium">Con:</span> {item.notes.con}
                  </div>
                )}
                {item.notes.sin && (
                  <div>
                    <span className="font-medium">Sin:</span> {item.notes.sin}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="w-full bg-white dark:bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full ${
            elapsedPercentage < 70 ? 'bg-success-500' : 
            elapsedPercentage < 100 ? 'bg-warning-500' : 
            'bg-danger-500'
          }`} 
          style={{ width: `${Math.min(elapsedPercentage, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={() => onCancel(id)}
          className="btn bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 flex-1 flex items-center justify-center"
        >
          <IoMdTrash className="h-4 w-4 text-danger-500 sm:hidden" />
          <span className="hidden sm:inline">Cancelar</span>
        </button>
        <button 
          onClick={() => onComplete(id)}
          className="btn bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 flex-1 flex items-center justify-center"
        >
          <FaCheckCircle className="h-4 w-4 text-success-500 sm:hidden" />
          <span className="hidden sm:inline">Servido</span>
        </button>
      </div>
    </div>
  );
};