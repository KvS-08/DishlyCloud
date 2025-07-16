import React from 'react';

export const KitchenOrderCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="space-y-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/12"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};