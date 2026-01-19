import React from 'react';
import { BackIcon } from './Icons';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, onBack }) => {
  return (
    <header className="sticky top-0 bg-white dark:bg-slate-900 shadow-sm z-10 p-4 flex items-center border-b border-gray-200 dark:border-slate-800">
      {onBack && (
        <button 
          onClick={onBack} 
          className="mr-4 p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Voltar"
        >
          <BackIcon />
        </button>
      )}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <h2 className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</h2>}
      </div>
    </header>
  );
};

export default Header;
