import React from 'react';
import SkeletonCard from '../ui/SkeletonCard';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  isLoading?: boolean;
  bgColorClass?: string;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = React.memo(
  ({ title, value, icon, description, isLoading, bgColorClass, className }) => {
    if (isLoading) {
      return <SkeletonCard />;
    }

    const backgroundClass = bgColorClass || "bg-white dark:bg-gray-800";

    return (
      <div className={`${backgroundClass} rounded-lg shadow-md p-4 flex flex-col justify-between ${className || ''}`}>
        <div>
          <div className="flex items-center justify-between mb-0">
            <h3 className="text-xs md:text-lg font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
            {icon && <div className="text-gray-500 dark:text-gray-400">{icon}</div>}
          </div>
          <p className="text-xs md:text-lg font-bold text-gray-900 dark:text-white">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

export default DashboardCard;