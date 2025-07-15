import React from 'react';

const InventoryItemSkeleton: React.FC = () => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
    </div>
  );
};

export default InventoryItemSkeleton;