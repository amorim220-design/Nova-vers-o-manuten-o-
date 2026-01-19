
import React from 'react';

interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ illustration, title, message }) => {
  return (
    <div className="text-center py-16 px-6 flex flex-col items-center">
      <div className="text-gray-300 dark:text-gray-600 mb-4">
        {illustration}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">{message}</p>
    </div>
  );
};

export default EmptyState;
