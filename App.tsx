import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import LoginView from './contexts/components/LoginView';
import UpdateModal from './contexts/components/UpdateModal';

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

import Modal from './contexts/components/Modal';
import ConfirmationModal from './contexts/components/ConfirmationModal';
import PhotoViewerModal from './contexts/components/PhotoViewerModal';

import { PlusIcon, CameraIcon, XCircleIcon, PencilIcon } from './contexts/components/Icons';
import { IconProvider } from './contexts/IconContext';

/* ======================================================
   Utils
====================================================== */
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

/* ======================================================
   APP
====================================================== */
const App: React.FC = () => {
  const { user, isAuthLoading, logout } = useAuth();

  const [data, setData] = useState<AppData>({
    userName: 'Usuário',
    hotels: [],
    scheduledTasks: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  /* ---------------- UPDATE ---------------- */
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [latestVersionInfo, setLatestVersionInfo] = useState<{
    version: string;
    url: string;
    notes: string[];
  } | null>(null);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return;

    const checkUpdate = async () => {
      try {
        const remote = await fetch(
          'https://raw.githubusercontent.com/amorim220-design/Nova-vers-o-manuten-o-/main/remote-version.json?' +
            Date.now()
        );
        const local = await fetch('/version.json');

        if (!remote.ok || !local.ok) return;

        const remoteData = await remote.json();
        const localData = await local.json();

        if (remoteData.versionCode > localData.versionCode) {
          setLatestVersionInfo(remoteData);
          setIsUpdateModalOpen(true);
        }
      } catch (e) {
        console.log('Update check failed', e);
      }
    };

    setTimeout(checkUpdate, 3000);
  }, []);

  const handleUpdateConfirm = () => {
    if (latestVersionInfo?.url) {
      window.open(latestVersionInfo.url, '_blank');
      setIsUpdateModalOpen(false);
    }
  };

  /* ---------------- FIRESTORE ---------------- */
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
    if (isInitialLoad.current || !user) return;
    setDoc(doc(db, 'users', user.uid), data);
  }, [data, user]);

  /* ---------------- UI STATE ---------------- */
  const [view, setView] = useState<View>('dashboard');
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<ConfirmModalConfig | null>(null);

  const [theme, setTheme] = useState<Theme>('light');
  const [iconStyle, setIconStyle] = useState<IconStyle>('solid');
  const [themeColor, setThemeColor] = useState<ThemeColor>('blue');

  /* ---------------- SELECTORS ---------------- */
  const selectedHotel = useMemo(
    () => data.hotels.find(h => h.id === selectedHotelId) || null,
    [data.hotels, selectedHotelId]
  );

  const selectedApartment = useMemo(
    () => selectedHotel?.apartments.find(a => a.id === selectedApartmentId) || null,
    [selectedHotel, selectedApartmentId]
  );

  /* ---------------- RENDER ---------------- */
  if (isAuthLoading || isLoading) {
    return <div className="h-screen flex items-center justify-center">Carregando…</div>;
  }

  if (!user) return <LoginView />;

  return (
    <IconProvider value={{ style: iconStyle }}>
      <div className="h-screen w-screen bg-gray-50 dark:bg-slate-950">
        <div className="max-w-2xl mx-auto h-full flex flex-col bg-white dark:bg-slate-900">
          <Dashboard onNavigate={setView} />

          {latestVersionInfo && (
            <UpdateModal
              isOpen={isUpdateModalOpen}
              version={latestVersionInfo.version}
              notes={latestVersionInfo.notes}
              onConfirm={handleUpdateConfirm}
              onCancel={() => setIsUpdateModalOpen(false)}
            />
          )}
        </div>
      </div>
    </IconProvider>
  );
};

export default App;
