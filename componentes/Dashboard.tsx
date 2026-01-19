
import React from 'react';
import { TimeIcon, SettingsIcon, BuildingSolidIcon } from './Icons';

type NavigableView = 'hotelList' | 'scheduleList' | 'charts' | 'billing' | 'settings';

interface DashboardButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="p-6 flex flex-col items-center justify-center space-y-3 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg hover:shadow-primary-500/20 dark:hover:shadow-primary-400/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
  >
    <div className="text-gray-600 dark:text-slate-300">{icon}</div>
    <span className="font-medium text-sm text-gray-700 dark:text-slate-300">{label}</span>
  </button>
);

interface DashboardProps {
  onNavigate: (view: NavigableView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <DashboardButton icon={<BuildingSolidIcon className="h-8 w-8" />} label="Hotéis" onClick={() => onNavigate('hotelList')} />
      <DashboardButton icon={<TimeIcon />} label="Cronograma" onClick={() => onNavigate('scheduleList')} />
      <DashboardButton icon={<SettingsIcon />} label="Opções" onClick={() => onNavigate('settings')} />
    </div>
  );
};

export default Dashboard;