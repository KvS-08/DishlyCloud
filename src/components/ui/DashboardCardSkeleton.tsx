import React from 'react';

const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  );
};

export default DashboardCardSkeleton;