
import React from 'react';
import { Hotel } from '../../types';
import { ChevronRightIcon, TrashIcon, BuildingSolidIcon, PencilIcon } from './Icons';
import EmptyState from './EmptyState';
import { HotelIllustration } from './Illustrations';

interface HotelListProps {
  hotels: Hotel[];
  onSelectHotel: (hotelId: string) => void;
  onDeleteHotel: (hotelId: string) => void;
  onEditHotel: (hotel: Hotel) => void;
  onPhotoClick: (photos: string[], startIndex: number) => void;
}

const HotelList: React.FC<HotelListProps> = ({ hotels, onSelectHotel, onDeleteHotel, onEditHotel, onPhotoClick }) => {
  if (hotels.length === 0) {
    return (
      <EmptyState
        illustration={<HotelIllustration className="w-40 h-40" />}
        title="Nenhum hotel cadastrado"
        message="Comece adicionando seu primeiro hotel para gerenciar os apartamentos."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {hotels.map(hotel => (
        <li key={hotel.id} className="flex items-stretch bg-gray-100 dark:bg-slate-800 rounded-2xl shadow-sm group border border-transparent dark:border-slate-700/50 overflow-hidden">
            <div className="flex-shrink-0 p-4 pr-0">
                <button
                    onClick={(e) => {
                        if (hotel.photo) {
                            e.stopPropagation();
                            onPhotoClick([hotel.photo], 0);
                        }
                    }}
                    disabled={!hotel.photo}
                    className="h-14 w-14 bg-gray-200 dark:bg-slate-700 rounded-xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-default"
                    aria-label="Ver foto do hotel"
                >
                    {hotel.photo ? (
                        <img src={hotel.photo} alt={hotel.name} className="h-full w-full rounded-xl object-cover"/>
                    ) : (
                        <BuildingSolidIcon className="h-7 w-7 text-gray-500 dark:text-slate-400" />
                    )}
                </button>
            </div>
            <button onClick={() => onSelectHotel(hotel.id)} className="flex-grow flex items-center p-4 text-left hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200">
                <div className="flex-grow min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{hotel.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{hotel.address}</p>
                </div>
                <ChevronRightIcon className="text-gray-400 dark:text-gray-600 ml-4 h-12 w-12 flex-shrink-0 transition-transform group-hover:translate-x-1" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEditHotel(hotel);
                }}
                className="flex-shrink-0 px-4 text-gray-400 hover:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors duration-200 flex items-center"
                aria-label={`Editar ${hotel.name}`}
            >
                <PencilIcon />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteHotel(hotel.id);
                }}
                className="flex-shrink-0 px-4 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-200 flex items-center"
                aria-label={`Excluir ${hotel.name}`}
            >
                <TrashIcon />
            </button>
        </li>
      ))}
    </ul>
  );
};

export default HotelList;
