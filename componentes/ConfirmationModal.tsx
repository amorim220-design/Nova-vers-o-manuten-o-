import React from 'react';
import ReactDOM from 'react-dom';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar' 
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[110] flex justify-center items-center p-4"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default ConfirmationModal;
