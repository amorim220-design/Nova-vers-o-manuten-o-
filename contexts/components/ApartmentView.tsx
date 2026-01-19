
import React, { useState } from 'react';
import { Apartment, Hotel, Item, ItemStatus, MaintenanceLog } from '../../types';
import Header from './Header';
import Modal from './Modal';
import { PlusIcon, CameraIcon, TrashIcon, XCircleIcon, XIcon, PencilIcon } from './Icons';

interface ApartmentViewProps {
  apartment: Apartment;
  hotel: Hotel;
  onBack: () => void;
  onUpdateApartment: (apartment: Apartment) => void;
  onPhotoClick: (photos: string[], startIndex: number) => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteItemPhoto: (itemId: string, photoIndex: number) => void;
}

const statusColors: { [key in ItemStatus]: string } = {
  [ItemStatus.OK]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [ItemStatus.NeedsRepair]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [ItemStatus.Damaged]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = err => reject(err);
  });
};

const ApartmentView: React.FC<ApartmentViewProps> = ({ apartment, hotel, onBack, onUpdateApartment, onPhotoClick, onDeleteItem, onDeleteItemPhoto }) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'history'>('checklist');
  const [historyFilter, setHistoryFilter] = useState<ItemStatus | 'all'>('all');
  
  // Modals state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);

  // Add Item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemPhotos, setNewItemPhotos] = useState<string[]>([]);

  // Edit Item state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editedItemName, setEditedItemName] = useState('');
  const [editedItemPhotos, setEditedItemPhotos] = useState<string[]>([]);

  // Log state
  const [logNotes, setLogNotes] = useState('');
  const [logPhotos, setLogPhotos] = useState<string[]>([]);
  const [currentItemIdForLog, setCurrentItemIdForLog] = useState<string | null>(null);

  const handleItemPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        const files = Array.from(event.target.files);
        const base64Photos = await Promise.all(files.map(fileToBase64));
        setNewItemPhotos(prev => [...prev, ...base64Photos].slice(0, 5));
        event.target.value = '';
    }
  };

  const removeItemPhoto = (index: number) => {
    setNewItemPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (newItemName.trim() === '') return;
    const newItem: Item = {
      id: Date.now().toString(),
      name: newItemName,
      status: ItemStatus.OK,
      photos: newItemPhotos,
    };
    onUpdateApartment({ ...apartment, items: [...apartment.items, newItem] });
    setNewItemName('');
    setNewItemPhotos([]);
    setIsItemModalOpen(false);
  };

  const handleUpdateItemStatus = (itemId: string, status: ItemStatus) => {
    const updatedItems = apartment.items.map(item =>
      item.id === itemId ? { ...item, status } : item
    );
    onUpdateApartment({ ...apartment, items: updatedItems });
  };
  
  const handleOpenLogModal = (itemId: string) => {
    setCurrentItemIdForLog(itemId);
    setIsLogModalOpen(true);
  };

  const handleLogPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const base64Photos = await Promise.all(files.map(fileToBase64));
      setLogPhotos(prev => [...prev, ...base64Photos].slice(0, 5));
      event.target.value = '';
    }
  };

  const removeLogPhoto = (index: number) => {
    setLogPhotos(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleAddLog = () => {
    if (!currentItemIdForLog || logNotes.trim() === '') return;
    const newLog: MaintenanceLog = {
      id: Date.now().toString(),
      itemId: currentItemIdForLog,
      date: new Date().toISOString(),
      notes: logNotes,
      photos: logPhotos,
    };
    onUpdateApartment({ ...apartment, maintenanceLogs: [newLog, ...apartment.maintenanceLogs] });
    
    setLogNotes('');
    setLogPhotos([]);
    setCurrentItemIdForLog(null);
    setIsLogModalOpen(false);
  };

  const handleOpenEditItemModal = (item: Item) => {
    setEditingItem(item);
    setEditedItemName(item.name);
    setEditedItemPhotos(item.photos || []);
    setIsEditItemModalOpen(true);
  };

  const handleSaveEditedItem = () => {
    if (!editingItem || editedItemName.trim() === '') return;

    const updatedItems = apartment.items.map(item =>
        item.id === editingItem.id ? { ...item, name: editedItemName, photos: editedItemPhotos } : item
    );
    onUpdateApartment({ ...apartment, items: updatedItems });

    setIsEditItemModalOpen(false);
    setEditingItem(null);
  };
  
  const handleEditedItemPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
          const files = Array.from(event.target.files);
          const base64Photos = await Promise.all(files.map(fileToBase64));
          setEditedItemPhotos(prev => [...prev, ...base64Photos].slice(0, 5));
          event.target.value = '';
      }
  };
  
  const removeEditedItemPhoto = (index: number) => {
      setEditedItemPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const filteredLogs = apartment.maintenanceLogs.filter(log => {
    if (historyFilter === 'all') return true;
    const item = apartment.items.find(i => i.id === log.itemId);
    return item && item.status === historyFilter;
  });

  return (
    <div className="flex flex-col h-full">
      <Header title={`Apto ${apartment.number}`} subtitle={hotel.name} onBack={onBack} />
      
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="flex -mb-px px-4">
          <button onClick={() => setActiveTab('checklist')} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'checklist' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>Checklist</button>
          <button onClick={() => setActiveTab('history')} className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}>Histórico</button>
        </nav>
      </div>

      {apartment.description && (
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">{apartment.description}</p>
        </div>
      )}

      <div className="flex-grow p-4 overflow-y-auto pb-20">
        {activeTab === 'checklist' && (
          <div>
            {apartment.items.length === 0 ? (
              <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Nenhum item cadastrado.</p></div>
            ) : (
              <ul className="space-y-3">
                {apartment.items.map(item => (
                  <li key={item.id} className="bg-gray-100 dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-transparent dark:border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                      <div className="flex items-center space-x-1">
                        <select value={item.status} onChange={(e) => handleUpdateItemStatus(item.id, e.target.value as ItemStatus)} className={`text-xs font-semibold px-2 py-1 rounded-full border-none focus:ring-0 ${statusColors[item.status]}`}>
                          {Object.values(ItemStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={() => handleOpenEditItemModal(item)} className="p-2 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 rounded-full" aria-label={`Editar item ${item.name}`}>
                          <PencilIcon />
                        </button>
                        <button onClick={() => onDeleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full" aria-label={`Excluir item ${item.name}`}>
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                    {item.photos && item.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {item.photos.map((photo, index) => (
                                <div key={index} className="relative">
                                  <button onClick={() => onPhotoClick(item.photos || [], index)} className="w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                                    <img src={photo} alt={`${item.name} ${index + 1}`} className="rounded-md object-cover h-24 w-full" />
                                  </button>
                                  <button
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onDeleteItemPhoto(item.id, index);
                                      }}
                                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 transition-opacity hover:bg-red-700"
                                      aria-label="Excluir foto"
                                  >
                                      <XIcon className="h-4 w-4" />
                                  </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <button onClick={() => handleOpenLogModal(item.id)} className="mt-3 text-sm text-primary-600 dark:text-primary-400 hover:underline">Registrar Manutenção</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === 'history' && (
           <div>
            <div className="mb-4">
              <label htmlFor="history-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por status do item</label>
              <select id="history-filter" value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value as ItemStatus | 'all')} className="input">
                  <option value="all">Todos</option>
                  <option value={ItemStatus.OK}>OK</option>
                  <option value={ItemStatus.NeedsRepair}>Requer Reparo</option>
                  <option value={ItemStatus.Damaged}>Danificado</option>
              </select>
            </div>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10"><p className="text-gray-500 dark:text-gray-400">Nenhum registro de manutenção encontrado.</p></div>
            ) : (
              <ul className="space-y-4">
                {filteredLogs.map(log => {
                  const item = apartment.items.find(i => i.id === log.itemId);
                  return (
                    <li key={log.id} className="bg-gray-100 dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-transparent dark:border-slate-700/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{item ? item.name : 'Item Removido'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.notes}</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(log.date).toLocaleString('pt-BR')}</p>
                        </div>
                        {log.photos.length > 0 && (
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {log.photos.map((photo, index) => (
                                <button key={index} onClick={() => onPhotoClick(log.photos, index)} className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                                  <img src={photo} alt={`Manutenção ${index + 1}`} className="rounded-md object-cover h-24 w-full" />
                                </button>
                            ))}
                          </div>
                        )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {activeTab === 'checklist' && (<button onClick={() => setIsItemModalOpen(true)} className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg z-20 transition-transform duration-200 ease-in-out hover:scale-110" aria-label="Adicionar Item"><PlusIcon /></button>)}

      <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="Adicionar Novo Item">
        <div className="space-y-4">
          <div>
            <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Item</label>
            <input type="text" id="itemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="input" placeholder="Ex: Ar Condicionado, Chuveiro"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotos do Item (opcional, máx 5)</label>
            <label htmlFor="item-photo-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500">
                <div className="space-y-1 text-center"><CameraIcon /><p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar</p></div>
                <input id="item-photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleItemPhotoUpload} />
            </label>
            {newItemPhotos.length > 0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {newItemPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <button onClick={() => onPhotoClick(newItemPhotos, index)} className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                        <img src={photo} alt={`Preview ${index}`} className="rounded-md object-cover h-20 w-full" />
                      </button>
                      <button onClick={() => removeItemPhoto(index)} className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"><XCircleIcon className="h-5 w-5"/></button>
                    </div>
                ))}
                </div>
            )}
          </div>
          <div className="flex justify-end pt-2"><button onClick={handleAddItem} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">Salvar Item</button></div>
        </div>
      </Modal>

      <Modal isOpen={isEditItemModalOpen} onClose={() => setIsEditItemModalOpen(false)} title={`Editar Item: ${editingItem?.name || ''}`}>
        <div className="space-y-4">
          <div>
            <label htmlFor="editItemName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Item</label>
            <input type="text" id="editItemName" value={editedItemName} onChange={(e) => setEditedItemName(e.target.value)} className="input"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotos do Item (opcional, máx 5)</label>
            <label htmlFor="edit-item-photo-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500">
                <div className="space-y-1 text-center"><CameraIcon /><p className="text-xs text-gray-500 dark:text-gray-500">Clique para adicionar</p></div>
                <input id="edit-item-photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleEditedItemPhotoUpload} />
            </label>
            {editedItemPhotos.length > 0 && (
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {editedItemPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <button onClick={() => onPhotoClick(editedItemPhotos, index)} className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                        <img src={photo} alt={`Preview ${index}`} className="rounded-md object-cover h-20 w-full" />
                      </button>
                      <button onClick={() => removeEditedItemPhoto(index)} className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"><XCircleIcon className="h-5 w-5"/></button>
                    </div>
                ))}
                </div>
            )}
          </div>
          <div className="flex justify-end pt-2"><button onClick={handleSaveEditedItem} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">Salvar Alterações</button></div>
        </div>
      </Modal>

      <Modal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} title={`Registrar Manutenção: ${apartment.items.find(i => i.id === currentItemIdForLog)?.name || ''}`}>
        <div className="space-y-4">
          <div>
            <label htmlFor="logNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label>
            <textarea id="logNotes" rows={3} value={logNotes} onChange={(e) => setLogNotes(e.target.value)} className="input" placeholder="Descreva o serviço realizado..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotos da Manutenção (opcional, máx 5)</label>
            <label htmlFor="log-photo-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500">
              <div className="space-y-1 text-center"><CameraIcon /><p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar</p></div>
              <input id="log-photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleLogPhotoUpload} />
            </label>
            {logPhotos.length > 0 && (
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {logPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <button onClick={() => onPhotoClick(logPhotos, index)} className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
                      <img src={photo} alt={`Preview ${index}`} className="rounded-md object-cover h-20 w-full" />
                    </button>
                    <button onClick={() => removeLogPhoto(index)} className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"><XCircleIcon className="h-5 w-5"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-2"><button onClick={handleAddLog} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md">Salvar Registro</button></div>
        </div>
      </Modal>
    </div>
  );
};

export default ApartmentView;
