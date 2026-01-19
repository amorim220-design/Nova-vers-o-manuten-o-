
import React from 'react';
import ReactDOM from 'react-dom';

interface UpdateModalProps {
  isOpen: boolean;
  version: string;
  notes: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, version, notes, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-4 overflow-hidden"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Atualização Disponível</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Uma nova versão ({version}) está pronta para ser instalada.
          </p>
          <div className="mt-4 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Novidades desta versão:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {notes.map((note, index) => <li key={index}>{note}</li>)}
            </ul>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex flex-col sm:flex-row-reverse sm:gap-3 gap-2 rounded-b-lg">
          <button 
            onClick={onConfirm} 
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Atualizar Agora
          </button>
          <button 
            onClick={onCancel} 
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Mais Tarde
          </button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default UpdateModal;
