import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface DateFilterProps {
  filter: string;
  setFilter: (filter: string) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filters = ['semanal', 'mensual', 'trimestral', 'anual'];

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="px-1 py-1 rounded-md text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 flex items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {filter.charAt(0).toUpperCase() + filter.slice(1)}
        <ChevronDown className="ml-0.5 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-38 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10">
          {filters.map((filter) => (
            <button
              key={filter}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => handleFilterChange(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DateFilter;