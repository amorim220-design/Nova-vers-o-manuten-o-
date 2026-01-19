
import React from 'react';
import Header from './Header';
import { Theme, IconStyle, ThemeColor } from '../../types';

interface SettingsViewProps {
  onBack: () => void;
  onLogout: () => void;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  currentIconStyle: IconStyle;
  onIconStyleChange: (style: IconStyle) => void;
  currentColor: ThemeColor;
  onColorChange: (color: ThemeColor) => void;
}

interface OptionButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-4 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-primary-600 text-white font-semibold shadow-md'
        : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'
    }`}
  >
    {label}
  </button>
);

const ColorSwatch: React.FC<{ color: ThemeColor, name: string, bgClass: string, isActive: boolean, onClick: () => void }> = ({ color, name, bgClass, isActive, onClick }) => (
    <div className="flex flex-col items-center space-y-2">
        <button
            onClick={onClick}
            className={`w-12 h-12 rounded-full ${bgClass} flex items-center justify-center transition-all duration-200 transform hover:scale-110 focus:outline-none ${isActive ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-primary-500' : ''}`}
            aria-label={`Selecionar cor ${name}`}
        >
            {isActive && (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{name}</span>
    </div>
);


const SettingsView: React.FC<SettingsViewProps> = ({ 
    onBack, 
    onLogout,
    currentTheme, 
    onThemeChange, 
    currentIconStyle, 
    onIconStyleChange,
    currentColor,
    onColorChange,
}) => {

  const colorOptions: { name: ThemeColor; bgClass: string; displayName: string; }[] = [
    { name: 'blue', bgClass: 'bg-blue-600', displayName: 'Azul' },
    { name: 'green', bgClass: 'bg-green-600', displayName: 'Verde' },
    { name: 'violet', bgClass: 'bg-violet-600', displayName: 'Violeta' },
    { name: 'rose', bgClass: 'bg-rose-600', displayName: 'Rosa' },
    { name: 'orange', bgClass: 'bg-orange-600', displayName: 'Laranja' },
    { name: 'slate', bgClass: 'bg-slate-600', displayName: 'Cinza' },
  ];

  return (
    <div className="flex flex-col h-full">
      <Header title="Opções" onBack={onBack} />
      <div className="flex-grow p-6 overflow-y-auto space-y-8 pb-24">
        
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Aparência</h3>
          <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl space-y-6">
            <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tema</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <OptionButton label="Claro" isActive={currentTheme === 'light'} onClick={() => onThemeChange('light')} />
                    <OptionButton label="Escuro" isActive={currentTheme === 'dark'} onClick={() => onThemeChange('dark')} />
                </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Cor de Destaque</h3>
          <div className="flex justify-around items-center p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl flex-wrap gap-4">
            {colorOptions.map(opt => (
              <ColorSwatch 
                key={opt.name}
                color={opt.name}
                name={opt.displayName}
                bgClass={opt.bgClass}
                isActive={currentColor === opt.name}
                onClick={() => onColorChange(opt.name)}
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Estilo dos Ícones</h3>
          <div className="grid grid-cols-2 gap-4">
            <OptionButton
              label="Sólido"
              isActive={currentIconStyle === 'solid'}
              onClick={() => onIconStyleChange('solid')}
            />
            <OptionButton
              label="Contorno"
              isActive={currentIconStyle === 'outline'}
              onClick={() => onIconStyleChange('outline')}
            />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Conta</h3>
          <div className="p-2 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={onLogout}
              className="w-full text-center p-4 rounded-lg transition-colors duration-200 bg-gray-200 dark:bg-slate-700/80 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold"
            >
              Sair da Conta
            </button>
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default SettingsView;
