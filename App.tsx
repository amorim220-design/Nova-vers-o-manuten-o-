const [fatalError, setFatalError] = useState<string | null>(null);

useEffect(() => {
  window.onerror = function (msg, url, line) {
    setFatalError(`${msg}\n${url}:${line}`);
    return true;
  };
}, []);
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';

import {
  Hotel,
  Apartment,
  AppData,
  ScheduledTask,
  TaskPriority,
  Theme,
  IconStyle,
  ThemeColor,
  ItemStatus,
} from './types';

import Dashboard from './contexts/components/Dashboard';
import Header from './contexts/components/Header';
import HotelList from './contexts/components/HotelList';
import HotelView from './contexts/components/HotelView';
import ApartmentView from './contexts/components/ApartmentView';
import ScheduleView from './contexts/components/ScheduleView';
import SettingsView from './contexts/components/SettingsView';
import LoginView from './contexts/components/LoginView';

import Modal from './contexts/components/Modal';
import ConfirmationModal from './contexts/components/ConfirmationModal';
import PhotoViewerModal from './contexts/components/PhotoViewerModal';
import UpdateModal from './contexts/components/UpdateModal';

import {
  PlusIcon,
  CameraIcon,
  XCircleIcon,
  PencilIcon,
} from './contexts/components/Icons';

import { IconProvider } from './contexts/IconContext';

/* ===========================
   Utils
=========================== */

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type View =
  | 'dashboard'
  | 'hotelList'
  | 'hotelView'
  | 'apartmentView'
  | 'scheduleList'
  | 'settings';

interface ConfirmModalConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

/* ===========================
   App
=========================== */

const App: React.FC = () => {
  const { user, isAuthLoading, logout } = useAuth();

  const [data, setData] = useState<AppData>({
    userName: 'Usuário',
    hotels: [],
    scheduledTasks: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  /* ---------- Navegação ---------- */
  const [view, setView] = useState<View>('dashboard');
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    null
  );

  /* ---------- Tema ---------- */
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || 'light'
  );
  const [iconStyle, setIconStyle] = useState<IconStyle>(
    (localStorage.getItem('iconStyle') as IconStyle) || 'solid'
  );
  const [themeColor, setThemeColor] = useState<ThemeColor>(
    (localStorage.getItem('themeColor') as ThemeColor) || 'blue'
  );

  /* ---------- Modals ---------- */
  const [confirmModal, setConfirmModal] =
    useState<ConfirmModalConfig | null>(null);

  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoViewerPhotos, setPhotoViewerPhotos] = useState<string[]>([]);
  const [photoViewerIndex, setPhotoViewerIndex] = useState(0);

  /* ---------- Update APK ---------- */
  const [updateInfo, setUpdateInfo] = useState<{
    version: string;
    url: string;
    notes: string[];
  } | null>(null);

  const [showUpdateModal, setShowUpdateModal] = useState(false);

  /* ===========================
     Firestore Sync
  =========================== */

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const ref = doc(db, 'users', user.uid);

    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setData(snap.data() as AppData);
      } else {
        setDoc(ref, data);
      }
      setIsLoading(false);
      isInitialLoad.current = false;
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user || isInitialLoad.current) return;
    setDoc(doc(db, 'users', user.uid), data);
  }, [data]);

  /* ===========================
     Update automático (APK)
  =========================== */

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const checkUpdate = async () => {
      try {
        const remote = await fetch(
          'https://raw.githubusercontent.com/amorim220-design/manuten-ao/main/remote-version.json'
        );
        const local = await fetch('/version.json');

        const r = await remote.json();
        const l = await local.json();

        if (r.versionCode > l.versionCode) {
          setUpdateInfo(r);
          setShowUpdateModal(true);
        }
      } catch (e) {
        console.log('Update check failed', e);
      }
    };

    setTimeout(checkUpdate, 3000);
  }, []);

  /* ===========================
     Helpers
  =========================== */

  const selectedHotel = useMemo(
    () => data.hotels.find(h => h.id === selectedHotelId) || null,
    [data.hotels, selectedHotelId]
  );

  const selectedApartment = useMemo(
    () =>
      selectedHotel?.apartments.find(a => a.id === selectedApartmentId) || null,
    [selectedHotel, selectedApartmentId]
  );

  const handlePhotoClick = (photos: string[], index: number) => {
    setPhotoViewerPhotos(photos);
    setPhotoViewerIndex(index);
    setIsPhotoViewerOpen(true);
  };

  const handleLogout = () =>
    setConfirmModal({
      title: 'Sair da conta?',
      message: 'Seus dados continuarão salvos.',
      confirmText: 'Sair',
      onConfirm: logout,
    });

  /* ===========================
     Render
  =========================== */

  if (isAuthLoading || isLoading)
    return <div className="h-screen flex items-center justify-center">Carregando…</div>;

  if (!user) return <LoginView />;

  return (
    <IconProvider value={{ style: iconStyle }}>
      <div className="h-screen bg-gray-50 dark:bg-slate-950">
        {view === 'dashboard' && <Dashboard onNavigate={setView} />}
        {view === 'hotelList' && (
          <>
            <Header title="Hotéis" onBack={() => setView('dashboard')} />
            <HotelList
              hotels={data.hotels}
              onSelectHotel={id => {
                setSelectedHotelId(id);
                setView('hotelView');
              }}
              onPhotoClick={handlePhotoClick}
            />
          </>
        )}

        {view === 'hotelView' && selectedHotel && (
          <HotelView
            hotel={selectedHotel}
            onBack={() => setView('hotelList')}
            onSelectApartment={id => {
              setSelectedApartmentId(id);
              setView('apartmentView');
            }}
            onPhotoClick={handlePhotoClick}
          />
        )}

        {view === 'apartmentView' && selectedHotel && selectedApartment && (
          <ApartmentView
            hotel={selectedHotel}
            apartment={selectedApartment}
            onBack={() => setView('hotelView')}
            onPhotoClick={handlePhotoClick}
          />
        )}

        {view === 'scheduleList' && (
          <>
            <Header title="Tarefas" onBack={() => setView('dashboard')} />
            <ScheduleView
              tasks={data.scheduledTasks}
              onUpdateTask={() => {}}
              onDeleteTask={() => {}}
            />
          </>
        )}

        {view === 'settings' && (
          <SettingsView
            onBack={() => setView('dashboard')}
            onLogout={handleLogout}
            currentTheme={theme}
            onThemeChange={setTheme}
            currentIconStyle={iconStyle}
            onIconStyleChange={setIconStyle}
            currentColor={themeColor}
            onColorChange={setThemeColor}
          />
        )}

        {/* Update Modal */}
        {updateInfo && (
          <UpdateModal
            isOpen={showUpdateModal}
            version={updateInfo.version}
            notes={updateInfo.notes}
            onConfirm={() => window.open(updateInfo.url, '_system')}
            onCancel={() => setShowUpdateModal(false)}
          />
        )}

        {/* Photo Viewer */}
        <PhotoViewerModal
          isOpen={isPhotoViewerOpen}
          photos={photoViewerPhotos}
          startIndex={photoViewerIndex}
          onClose={() => setIsPhotoViewerOpen(false)}
        />

        {/* Confirm Modal */}
        {confirmModal && (
          <ConfirmationModal
            isOpen
            title={confirmModal.title}
            message={confirmModal.message}
            confirmText={confirmModal.confirmText}
            onConfirm={confirmModal.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </div>
    </IconProvider>
  );
};

export default App;
