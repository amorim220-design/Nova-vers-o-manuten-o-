
import React, { useState } from 'react';
import { Hotel, Apartment } from '../../types';
import Header from './Header';
import { PlusIcon, ChevronRightIcon, DoorIcon, CameraIcon, XCircleIcon, TrashIcon, PencilIcon } from './Icons';
import Modal from './Modal';

interface HotelViewProps {
  hotel: Hotel;
  onBack: () => void;
  onSelectApartment: (apartmentId: string) => void;
  onUpdateApartments: (apartments: Apartment[]) => void;
  onDeleteApartment: (apartmentId: string) => void;
  onEditApartment: (apartment: Apartment) => void;
  onPhotoClick: (photos: string[], startIndex: number) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = err => reject(err);
  });
};

const HotelView: React.FC<HotelViewProps> = ({ hotel, onBack, onSelectApartment, onUpdateApartments, onDeleteApartment, onEditApartment, onPhotoClick }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newApartmentNumber, setNewApartmentNumber] = useState('');
    const [newApartmentDescription, setNewApartmentDescription] = useState('');
    const [newApartmentPhotos, setNewApartmentPhotos] = useState<string[]>([]);

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            const base64Photos = await Promise.all(files.map(fileToBase64));
            setNewApartmentPhotos(prev => [...prev, ...base64Photos].slice(0, 5));
            event.target.value = '';
        }
    };

    const removePhoto = (index: number) => {
        setNewApartmentPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddApartment = () => {
        if (newApartmentNumber.trim() === '') return;
        const newApartment: Apartment = {
            id: Date.now().toString(),
            number: newApartmentNumber,
            description: newApartmentDescription,
            items: [],
            maintenanceLogs: [],
            photos: newApartmentPhotos,
        };
        onUpdateApartments([...hotel.apartments, newApartment]);
        setNewApartmentNumber('');
        setNewApartmentDescription('');
        setNewApartmentPhotos([]);
        setIsModalOpen(false);
    };

  return (
    <div className="flex flex-col h-full">
      <Header title={hotel.name} subtitle={hotel.address} onBack={onBack} />
      <div className="flex-grow p-4 overflow-y-auto pb-24">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Apartamentos</h3>
        {hotel.apartments.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Nenhum apartamento cadastrado.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Clique no botão '+' para adicionar um.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {hotel.apartments.map(apartment => (
              <li key={apartment.id} className="flex items-stretch bg-gray-100 dark:bg-slate-800 rounded-2xl shadow-sm group border border-transparent dark:border-slate-700/50 overflow-hidden">
                  <div className="flex-shrink-0 p-4 pr-0">
                      <button
                          onClick={(e) => {
                              if (apartment.photos && apartment.photos.length > 0) {
                                  e.stopPropagation();
                                  onPhotoClick(apartment.photos, 0);
                              }
                          }}
                          disabled={!apartment.photos || apartment.photos.length === 0}
                          className="h-14 w-14 bg-gray-200 dark:bg-slate-700 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-default"
                          aria-label="Ver fotos do apartamento"
                      >
                          {apartment.photos && apartment.photos.length > 0 ? (
                              <img src={apartment.photos[0]} alt={`Apto ${apartment.number}`} className="h-full w-full rounded-xl object-cover"/>
                          ) : (
                              <DoorIcon />
                          )}
                      </button>
                  </div>
                  <button onClick={() => onSelectApartment(apartment.id)} className="flex-grow flex items-center p-4 text-left hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200">
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">Apartamento {apartment.number}</p>
                        <p className={`text-sm text-gray-500 dark:text-gray-400 truncate ${!apartment.description ? 'italic' : ''}`}>{apartment.description || `${apartment.items.length} itens cadastrados`}</p>
                    </div>
                    <ChevronRightIcon className="text-gray-400 dark:text-gray-600 ml-4 h-12 w-12 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onEditApartment(apartment);
                      }}
                      className="flex-shrink-0 px-4 text-gray-400 hover:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200 flex items-center"
                      aria-label={`Editar Apartamento ${apartment.number}`}
                  >
                      <PencilIcon />
                  </button>
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onDeleteApartment(apartment.id);
                      }}
                      className="flex-shrink-0 px-4 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center"
                      aria-label={`Excluir Apartamento ${apartment.number}`}
                  >
                      <TrashIcon />
                  </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg z-20 transition-transform duration-200 ease-in-out hover:scale-110"
        aria-label="Adicionar Apartamento"
        >
        <PlusIcon />
      </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Novo Apartamento">
            <div className="space-y-4">
                <div>
                    <label htmlFor="apartmentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número do Apartamento</label>
                    <input
                        type="text"
                        id="apartmentNumber"
                        value={newApartmentNumber}
                        onChange={(e) => setNewApartmentNumber(e.target.value)}
                        className="input"
                        placeholder="Ex: 101, 20B"
                    />
                </div>
                 <div>
                    <label htmlFor="apartmentDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição (opcional)</label>
                    <textarea
                        id="apartmentDescription"
                        value={newApartmentDescription}
                        onChange={(e) => setNewApartmentDescription(e.target.value)}
                        rows={2}
                        className="input"
                        placeholder="Ex: Vista para o mar, 2 quartos"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotos (opcional, máx 5)</label>
                    <label htmlFor="apt-photo-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500">
                      <div className="space-y-1 text-center">
                        <CameraIcon />
                        <p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar</p>
                      </div>
                      <input id="apt-photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handlePhotoUpload} />
                    </label>
                    {newApartmentPhotos.length > 0 && (
                      <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {newApartmentPhotos.map((photo, index) => (
                          <div key={index} className="relative">
                            <button onClick={() => onPhotoClick(newApartmentPhotos, index)} className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                                <img src={photo} alt={`Preview ${index}`} className="rounded-md object-cover h-20 w-full" />
                            </button>
                            <button onClick={() => removePhoto(index)} className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5">
                              <XCircleIcon className="h-5 w-5"/>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleAddApartment}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Salvar Apartamento
                    </button>
                </div>
            </div>
        </Modal>
    </div>
  );
};

export default HotelView;
