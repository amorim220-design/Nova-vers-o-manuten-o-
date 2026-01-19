import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './Icons';

interface PhotoViewerModalProps {
  isOpen: boolean;
  photos: string[];
  startIndex?: number;
  onClose: () => void;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ isOpen, photos, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(startIndex);
    }
  }, [isOpen, startIndex]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? photos.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === photos.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, photos.length, onClose, goToNext, goToPrevious]);

  if (!isOpen || photos.length === 0) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full max-w-4xl max-h-4xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50"
          aria-label="Fechar"
        >
          <XIcon className="h-6 w-6" />
        </button>

        {photos.length > 1 && (
            <button 
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50"
                aria-label="Anterior"
            >
                <ChevronLeftIcon className="h-8 w-8" />
            </button>
        )}

        <div className="relative w-full h-full flex items-center justify-center">
            <img 
                src={photos[currentIndex]} 
                alt={`Foto ${currentIndex + 1} de ${photos.length}`}
                className="max-h-full max-w-full object-contain rounded-lg"
            />
        </div>

        {photos.length > 1 && (
            <button 
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-50"
                aria-label="Próxima"
            >
                <ChevronRightIcon className="h-8 w-8" />
            </button>
        )}

        {photos.length > 1 && (
          <div className="absolute bottom-4 text-white text-sm bg-black bg-opacity-60 px-3 py-1 rounded-full">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>
    </div>
  );
  
  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default PhotoViewerModal;
