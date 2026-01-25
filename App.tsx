import React, { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from "./firebase";
import { useAuth } from "./contexts/AuthContext";
import LoginView from "./contexts/components/LoginView";

import {
  Apartment,
  AppData,
  Hotel,
  IconStyle,
  ItemStatus,
  ScheduledTask,
  TaskPriority,
  Theme,
  ThemeColor,
} from "./types";

import Dashboard from "./contexts/components/Dashboard";
import Header from "./contexts/components/Header";
import HotelList from "./contexts/components/HotelList";
import HotelView from "./contexts/components/HotelView";
import ApartmentView from "./contexts/components/ApartmentView";
import ScheduleView from "./contexts/components/ScheduleView";
import SettingsView from "./contexts/components/SettingsView";

import Modal from "./contexts/components/Modal";
import ConfirmationModal from "./contexts/components/ConfirmationModal";
import PhotoViewerModal from "./contexts/components/PhotoViewerModal";
import UpdateModal from "./contexts/components/UpdateModal";

import { IconProvider } from "./contexts/IconContext";
import { PlusIcon, CameraIcon, XCircleIcon, PencilIcon } from "./contexts/components/Icons";

type View =
  | "dashboard"
  | "hotelList"
  | "hotelView"
  | "apartmentView"
  | "scheduleList"
  | "charts"
  | "billing"
  | "settings";

interface ConfirmModalConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });

const App: React.FC = () => {
  const { user, isAuthLoading, logout } = useAuth();

  // ✅ Anti-tela-branca: se algo der ruim, mostra na tela
  const [fatalError, setFatalError] = useState<string | null>(null);
  const setFatal = (err: unknown, where: string) => {
    const msg =
      err instanceof Error ? `${err.message}\n${err.stack || ""}` : String(err);
    console.error("FATAL:", where, err);
    setFatalError(`[${where}]\n${msg}`);
  };

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AppData>({
    userName: "Usuário",
    hotels: [],
    scheduledTasks: [],
  });
  const isInitialLoad = useRef(true);

  const [view, setView] = useState<View>("dashboard");
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<ConfirmModalConfig | null>(null);

  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [iconStyle, setIconStyle] = useState<IconStyle>(() => {
    return (localStorage.getItem("iconStyle") as IconStyle | null) || "solid";
  });

  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    return (localStorage.getItem("themeColor") as ThemeColor | null) || "blue";
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Photo viewer
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [photoViewerPhotos, setPhotoViewerPhotos] = useState<string[]>([]);
  const [photoViewerStartIndex, setPhotoViewerStartIndex] = useState(0);

  // Modals
  const [isAddHotelModalOpen, setIsAddHotelModalOpen] = useState(false);
  const [newHotelName, setNewHotelName] = useState("");
  const [newHotelAddress, setNewHotelAddress] = useState("");
  const [newHotelPhoto, setNewHotelPhoto] = useState<string | null>(null);

  const [isEditHotelModalOpen, setIsEditHotelModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editedHotelName, setEditedHotelName] = useState("");
  const [editedHotelAddress, setEditedHotelAddress] = useState("");
  const [editedHotelPhoto, setEditedHotelPhoto] = useState<string | null>(null);

  const [isEditApartmentModalOpen, setIsEditApartmentModalOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [editedApartmentNumber, setEditedApartmentNumber] = useState("");
  const [editedApartmentDescription, setEditedApartmentDescription] = useState("");
  const [editedApartmentPhotos, setEditedApartmentPhotos] = useState<string[]>([]);

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>(TaskPriority.Medium);

  // Update modal (SEM Browser plugin)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [latestVersionInfo, setLatestVersionInfo] = useState<{
    version: string;
    url: string;
    notes: string[];
    versionCode?: number;
  } | null>(null);

  const cleanLoadedData = (loadedData: any): AppData => {
    const dataToClean = loadedData || {};
    const cleaned: AppData = {
      userName: dataToClean.userName || "Usuário",
      hotels: [],
      scheduledTasks: [],
    };

    cleaned.hotels = (dataToClean.hotels || [])
      .filter(Boolean)
      .map((hotel: any) => ({
        id: hotel.id || `hotel_${Date.now()}_${Math.random()}`,
        name: hotel.name || "Nome do Hotel",
        address: hotel.address || "",
        photo: hotel.photo === undefined ? null : hotel.photo,
        apartments: (hotel.apartments || [])
          .filter(Boolean)
          .map((apt: any) => ({
            id: apt.id || `apt_${Date.now()}_${Math.random()}`,
            number: apt.number || "0",
            description: apt.description || "",
            photos: (apt.photos || []).filter(Boolean),
            items: (apt.items || [])
              .filter(Boolean)
              .map((item: any) => ({
                id: item.id || `item_${Date.now()}_${Math.random()}`,
                name: item.name || "Nome do Item",
                status: item.status || ItemStatus.OK,
                photos: (item.photos || []).filter(Boolean),
              })),
            maintenanceLogs: (apt.maintenanceLogs || [])
              .filter(Boolean)
              .map((log: any) => ({
                id: log.id || `log_${Date.now()}_${Math.random()}`,
                date: log.date || new Date().toISOString(),
                notes: log.notes || "",
                photos: (log.photos || []).filter(Boolean),
                itemId: log.itemId || "",
              })),
          })),
      }));

    cleaned.scheduledTasks = (dataToClean.scheduledTasks || [])
      .filter(Boolean)
      .map((task: any) => ({
        id: task.id || `task_${Date.now()}_${Math.random()}`,
        title: task.title || "Tarefa",
        description: task.description || "",
        dueDate: task.dueDate || new Date().toISOString().split("T")[0],
        priority: task.priority || TaskPriority.Medium,
        isComplete: !!task.isComplete,
        notificationSent: !!task.notificationSent,
      }));

    return cleaned;
  };

  // Theme effects
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("iconStyle", iconStyle);
  }, [iconStyle]);

  useEffect(() => {
    const root = document.documentElement;
    const colors: ThemeColor[] = ["blue", "green", "violet", "rose", "orange", "slate"];
    colors.forEach((c) => root.classList.remove(`theme-${c}`));
    root.classList.add(`theme-${themeColor}`);
    localStorage.setItem("themeColor", themeColor);
  }, [themeColor]);

  // Firestore listener
  useEffect(() => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const docRef = doc(db, "users", user.uid);

      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          try {
            if (docSnap.exists()) {
              const loadedData = docSnap.data();
              const cleanedData = cleanLoadedData(loadedData);
              setData(cleanedData);
            } else {
              const initialData: AppData = { userName: "Usuário", hotels: [], scheduledTasks: [] };
              setDoc(docRef, initialData);
              setData(initialData);
            }
            setIsLoading(false);
            isInitialLoad.current = false;
          } catch (e) {
            setFatal(e, "Firestore:onSnapshot");
            setIsLoading(false);
          }
        },
        (error) => {
          setFatal(error, "Firestore:onSnapshot(error)");
          setIsLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      setFatal(e, "Firestore:setup");
      setIsLoading(false);
      return;
    }
  }, [user]);

  // Save data to Firestore
  useEffect(() => {
    if (isLoading || isInitialLoad.current || !user) return;

    const docRef = doc(db, "users", user.uid);
    setDoc(docRef, data).catch((error) => setFatal(error, "Firestore:setDoc(save)"));
  }, [data, isLoading, user]);

  // Update check (sem Browser plugin)
  useEffect(() => {
    const checkForUpdates = async () => {
      if (Capacitor.getPlatform() !== "android") return;

      try {
        const remoteVersionUrl =
          "https://raw.githubusercontent.com/amorim2/manuten-ao/main/remote-version.json";

        const [remoteResponse, localResponse] = await Promise.all([
          fetch(`${remoteVersionUrl}?t=${Date.now()}`),
          fetch("/version.json"),
        ]);

        if (!remoteResponse.ok || !localResponse.ok) return;

        const remoteInfo = await remoteResponse.json();
        const localInfo = await localResponse.json();

        const currentVersionCode = Number(localInfo.versionCode || 0);
        const latestVersionCode = Number(remoteInfo.versionCode || 0);

        if (latestVersionCode > currentVersionCode) {
          const lastSkippedVersion = localStorage.getItem("skipped_update_version");
          const lastSkippedTime = parseInt(localStorage.getItem("skipped_update_time") || "0", 10);
          const twentyFourHours = 24 * 60 * 60 * 1000;

          if (lastSkippedVersion === remoteInfo.version && Date.now() - lastSkippedTime < twentyFourHours) {
            return;
          }

          setLatestVersionInfo(remoteInfo);
          setIsUpdateModalOpen(true);
        }
      } catch (e) {
        // não mata o app por update
        console.error("Update check failed:", e);
      }
    };

    const t = setTimeout(checkForUpdates, 2500);
    return () => clearTimeout(t);
  }, []);

  const handleUpdateConfirm = async () => {
    try {
      if (!latestVersionInfo?.url) return;

      // Sem Browser plugin: tenta abrir de forma simples
      // Em muitos Androids isso abre o navegador padrão.
      window.open(latestVersionInfo.url, "_blank");

      setIsUpdateModalOpen(false);
    } catch (e) {
      setFatal(e, "Update:openURL");
    }
  };

  const handleUpdateCancel = () => {
    if (latestVersionInfo) {
      localStorage.setItem("skipped_update_version", latestVersionInfo.version);
      localStorage.setItem("skipped_update_time", Date.now().toString());
    }
    setIsUpdateModalOpen(false);
  };

  // Navigation
  const navigateTo = (newView: View) => setView(newView);

  const selectedHotel = useMemo(() => {
    return data.hotels.find((h) => h.id === selectedHotelId) || null;
  }, [data.hotels, selectedHotelId]);

  const selectedApartment = useMemo(() => {
    return selectedHotel?.apartments.find((a) => a.id === selectedApartmentId) || null;
  }, [selectedHotel, selectedApartmentId]);

  const handleSelectHotel = (hotelId: string) => {
    setSelectedHotelId(hotelId);
    navigateTo("hotelView");
  };

  const handleSelectApartment = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId);
    navigateTo("apartmentView");
  };

  const handleBack = () => {
    switch (view) {
      case "hotelList":
      case "scheduleList":
      case "settings":
        navigateTo("dashboard");
        break;
      case "hotelView":
        setSelectedHotelId(null);
        navigateTo("hotelList");
        break;
      case "apartmentView":
        setSelectedApartmentId(null);
        navigateTo("hotelView");
        break;
      default:
        navigateTo("dashboard");
    }
  };

  // Handlers
  const handleSaveName = () => {
    const finalName = tempName.trim();
    if (finalName && finalName !== data.userName) {
      setData((prev) => ({ ...prev, userName: finalName }));
    }
    setIsEditingName(false);
  };

  const handleLogout = () => {
    setConfirmModalConfig({
      title: "Sair da Conta?",
      message: "Você tem certeza que deseja sair? Seus dados estão salvos na nuvem.",
      confirmText: "Sair",
      onConfirm: () => {
        logout();
        setConfirmModalConfig(null);
      },
    });
  };

  const handlePhotoClick = (photos: string[], startIndex: number) => {
    setPhotoViewerPhotos(photos);
    setPhotoViewerStartIndex(startIndex);
    setIsPhotoViewerOpen(true);
  };

  const handleAddHotel = () => {
    if (!newHotelName.trim()) return;
    const newHotel: Hotel = {
      id: Date.now().toString(),
      name: newHotelName,
      address: newHotelAddress,
      apartments: [],
      photo: newHotelPhoto,
    };
    setData((prev) => ({ ...prev, hotels: [...prev.hotels, newHotel] }));
    setIsAddHotelModalOpen(false);
    setNewHotelName("");
    setNewHotelAddress("");
    setNewHotelPhoto(null);
  };

  const handleOpenEditHotelModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setEditedHotelName(hotel.name);
    setEditedHotelAddress(hotel.address);
    setEditedHotelPhoto(hotel.photo);
    setIsEditHotelModalOpen(true);
  };

  const handleUpdateHotel = () => {
    if (!editingHotel || !editedHotelName.trim()) return;
    const updatedHotel: Hotel = {
      ...editingHotel,
      name: editedHotelName,
      address: editedHotelAddress,
      photo: editedHotelPhoto,
    };
    setData((prev) => ({
      ...prev,
      hotels: prev.hotels.map((h) => (h.id === updatedHotel.id ? updatedHotel : h)),
    }));
    setIsEditHotelModalOpen(false);
    setEditingHotel(null);
  };

  const handleHotelPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const base64 = await fileToBase64(e.target.files[0]);
        setNewHotelPhoto(base64);
      }
    } catch (err) {
      setFatal(err, "HotelPhotoUpload");
    }
  };

  const handleEditedHotelPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const base64 = await fileToBase64(e.target.files[0]);
        setEditedHotelPhoto(base64);
      }
    } catch (err) {
      setFatal(err, "EditedHotelPhotoUpload");
    }
  };

  const handleDeleteHotel = (hotelId: string) => {
    const hotel = data.hotels.find((h) => h.id === hotelId);
    if (!hotel) return;

    setConfirmModalConfig({
      title: `Excluir Hotel "${hotel.name}"?`,
      message:
        "Esta ação é permanente. Todos os apartamentos e registros de manutenção associados a este hotel serão perdidos.",
      confirmText: "Excluir Hotel",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          hotels: prev.hotels.filter((h) => h.id !== hotelId),
        }));
        setConfirmModalConfig(null);
      },
    });
  };

  const handleUpdateApartments = (hotelId: string, apartments: Apartment[]) => {
    setData((prev) => ({
      ...prev,
      hotels: prev.hotels.map((h) => (h.id === hotelId ? { ...h, apartments } : h)),
    }));
  };

  const handleOpenEditApartmentModal = (apartment: Apartment) => {
    setEditingApartment(apartment);
    setEditedApartmentNumber(apartment.number);
    setEditedApartmentDescription(apartment.description);
    setEditedApartmentPhotos(apartment.photos);
    setIsEditApartmentModalOpen(true);
  };

  const handleSaveEditedApartment = () => {
    if (!editingApartment || !selectedHotelId || !editedApartmentNumber.trim()) return;

    const updatedApartment: Apartment = {
      ...editingApartment,
      number: editedApartmentNumber,
      description: editedApartmentDescription,
      photos: editedApartmentPhotos,
    };

    setData((prev) => ({
      ...prev,
      hotels: prev.hotels.map((h) =>
        h.id !== selectedHotelId
          ? h
          : { ...h, apartments: h.apartments.map((a) => (a.id === updatedApartment.id ? updatedApartment : a)) }
      ),
    }));

    setIsEditApartmentModalOpen(false);
    setEditingApartment(null);
  };

  const handleEditedAptPhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files) {
        const files = Array.from(event.target.files);
        const base64Photos = await Promise.all(files.map(fileToBase64));
        setEditedApartmentPhotos((prev) => [...prev, ...base64Photos].slice(0, 5));
        event.target.value = "";
      }
    } catch (err) {
      setFatal(err, "EditedAptPhotoUpload");
    }
  };

  const removeEditedAptPhoto = (index: number) => {
    setEditedApartmentPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteApartment = (hotelId: string, apartmentId: string) => {
    const hotel = data.hotels.find((h) => h.id === hotelId);
    const apartment = hotel?.apartments.find((a) => a.id === apartmentId);
    if (!apartment || !hotel) return;

    setConfirmModalConfig({
      title: `Excluir Apto "${apartment.number}"?`,
      message: `Você tem certeza que deseja excluir o apartamento ${apartment.number} do hotel ${hotel.name}? Todos os seus dados serão perdidos.`,
      confirmText: "Excluir Apartamento",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          hotels: prev.hotels.map((h) =>
            h.id === hotelId ? { ...h, apartments: h.apartments.filter((a) => a.id !== apartmentId) } : h
          ),
        }));
        setConfirmModalConfig(null);
      },
    });
  };

  const handleDeleteItem = (hotelId: string, apartmentId: string, itemId: string) => {
    const hotel = data.hotels.find((h) => h.id === hotelId);
    const apartment = hotel?.apartments.find((a) => a.id === apartmentId);
    const item = apartment?.items.find((i) => i.id === itemId);
    if (!item || !apartment) return;

    setConfirmModalConfig({
      title: `Excluir Item "${item.name}"?`,
      message: `Você tem certeza que deseja excluir o item ${item.name} do apartamento ${apartment.number}?`,
      confirmText: "Excluir Item",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          hotels: prev.hotels.map((h) =>
            h.id !== hotelId
              ? h
              : {
                  ...h,
                  apartments: h.apartments.map((a) =>
                    a.id !== apartmentId ? a : { ...a, items: a.items.filter((i) => i.id !== itemId) }
                  ),
                }
          ),
        }));
        setConfirmModalConfig(null);
      },
    });
  };

  const handleDeleteItemPhoto = (
    hotelId: string,
    apartmentId: string,
    itemId: string,
    photoIndex: number
  ) => {
    const hotel = data.hotels.find((h) => h.id === hotelId);
    const apartment = hotel?.apartments.find((a) => a.id === apartmentId);
    const item = apartment?.items.find((i) => i.id === itemId);
    if (!item) return;

    setConfirmModalConfig({
      title: "Excluir Foto?",
      message: `Você tem certeza que deseja excluir esta foto do item "${item.name}"?`,
      confirmText: "Excluir Foto",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          hotels: prev.hotels.map((h) =>
            h.id !== hotelId
              ? h
              : {
                  ...h,
                  apartments: h.apartments.map((a) =>
                    a.id !== apartmentId
                      ? a
                      : {
                          ...a,
                          items: a.items.map((i) =>
                            i.id !== itemId
                              ? i
                              : { ...i, photos: i.photos.filter((_, idx) => idx !== photoIndex) }
                          ),
                        }
                  ),
                }
          ),
        }));
        setConfirmModalConfig(null);
      },
    });
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) return;

    const newTask: ScheduledTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      dueDate: newTaskDueDate,
      priority: newTaskPriority,
      isComplete: false,
      notificationSent: false,
    };

    setData((prev) => ({ ...prev, scheduledTasks: [...prev.scheduledTasks, newTask] }));
    setIsAddTaskModalOpen(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate("");
    setNewTaskPriority(TaskPriority.Medium);
  };

  const handleUpdateTask = (updatedTask: ScheduledTask) => {
    setData((prev) => ({
      ...prev,
      scheduledTasks: prev.scheduledTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const task = data.scheduledTasks.find((t) => t.id === taskId);
    if (!task) return;

    setConfirmModalConfig({
      title: "Excluir Tarefa?",
      message: `Você tem certeza que deseja excluir a tarefa "${task.title}"?`,
      confirmText: "Excluir Tarefa",
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          scheduledTasks: prev.scheduledTasks.filter((t) => t.id !== taskId),
        }));
        setConfirmModalConfig(null);
      },
    });
  };

  // Loading/Auth + Fatal screen
  if (fatalError) {
    return (
      <div className="h-screen w-screen p-4 bg-black text-white" style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>ERRO NO APP</h2>
        {fatalError}
      </div>
    );
  }

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginView />;

  // Render view
  const renderView = () => {
    switch (view) {
      case "dashboard":
        return (
          <>
            <header className="bg-white dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-800">
              {isEditingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">Olá,</span>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    placeholder="Seu nome"
                    className="input !p-1 !text-xl !font-semibold w-40 sm:w-48"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-semibold hover:bg-primary-700"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {data.userName}!</h1>
                  <button
                    onClick={() => {
                      setTempName(data.userName);
                      setIsEditingName(true);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full"
                  >
                    <PencilIcon />
                  </button>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400">Bem-vindo ao seu painel de manutenção.</p>
            </header>

            <div className="flex-grow overflow-y-auto">
              <Dashboard onNavigate={navigateTo} />
            </div>
          </>
        );

      case "hotelList":
        return (
          <div className="flex flex-col h-full">
            <Header title="Hotéis" onBack={handleBack} />
            <div className="flex-grow p-4 overflow-y-auto pb-24">
              <HotelList
                hotels={data.hotels}
                onSelectHotel={handleSelectHotel}
                onDeleteHotel={handleDeleteHotel}
                onEditHotel={handleOpenEditHotelModal}
                onPhotoClick={handlePhotoClick}
              />
            </div>
          </div>
        );

      case "hotelView":
        if (!selectedHotel) return <div className="p-4">Hotel não encontrado.</div>;
        return (
          <HotelView
            hotel={selectedHotel}
            onBack={handleBack}
            onSelectApartment={handleSelectApartment}
            onUpdateApartments={(apartments) => handleUpdateApartments(selectedHotel.id, apartments)}
            onDeleteApartment={(apartmentId) => handleDeleteApartment(selectedHotel.id, apartmentId)}
            onEditApartment={handleOpenEditApartmentModal}
            onPhotoClick={handlePhotoClick}
          />
        );

      case "apartmentView":
        if (!selectedHotel || !selectedApartment) return <div className="p-4">Apartamento não encontrado.</div>;
        return (
          <ApartmentView
            apartment={selectedApartment}
            hotel={selectedHotel}
            onBack={handleBack}
            onUpdateApartment={(apartment) =>
              setData((prev) => ({
                ...prev,
                hotels: prev.hotels.map((h) =>
                  h.id !== selectedHotel.id
                    ? h
                    : { ...h, apartments: h.apartments.map((a) => (a.id === apartment.id ? apartment : a)) }
                ),
              }))
            }
            onPhotoClick={handlePhotoClick}
            onDeleteItem={(itemId) => handleDeleteItem(selectedHotel.id, selectedApartment.id, itemId)}
            onDeleteItemPhoto={(itemId, photoIndex) =>
              handleDeleteItemPhoto(selectedHotel.id, selectedApartment.id, itemId, photoIndex)
            }
          />
        );

      case "scheduleList":
        return (
          <div className="flex flex-col h-full">
            <Header title="Cronograma de Tarefas" onBack={handleBack} />
            <div className="flex-grow p-4 overflow-y-auto pb-24">
              <ScheduleView tasks={data.scheduledTasks} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            </div>
          </div>
        );

      case "settings":
        return (
          <SettingsView
            onBack={handleBack}
            onLogout={handleLogout}
            currentTheme={theme}
            onThemeChange={setTheme}
            currentIconStyle={iconStyle}
            onIconStyleChange={setIconStyle}
            currentColor={themeColor}
            onColorChange={setThemeColor}
          />
        );

      default:
        return <div className="p-4">Tela inválida.</div>;
    }
  };

  const renderFab = () => {
    if (view === "hotelList" || view === "scheduleList") {
      return (
        <button
          onClick={() => {
            if (view === "hotelList") setIsAddHotelModalOpen(true);
            if (view === "scheduleList") setIsAddTaskModalOpen(true);
          }}
          className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg z-20 transition-transform duration-200 ease-in-out hover:scale-110"
          aria-label={view === "hotelList" ? "Adicionar Hotel" : "Adicionar Tarefa"}
        >
          <PlusIcon />
        </button>
      );
    }
    return null;
  };

  return (
    <IconProvider value={{ style: iconStyle }}>
      <div className="h-screen w-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
        <div className="container mx-auto max-w-2xl h-full flex flex-col bg-white dark:bg-slate-900 shadow-2xl relative">
          {renderView()}
          {renderFab()}

          <PhotoViewerModal
            isOpen={isPhotoViewerOpen}
            photos={photoViewerPhotos}
            startIndex={photoViewerStartIndex}
            onClose={() => setIsPhotoViewerOpen(false)}
          />

          {confirmModalConfig && (
            <ConfirmationModal
              isOpen={!!confirmModalConfig}
              title={confirmModalConfig.title}
              message={confirmModalConfig.message}
              onConfirm={confirmModalConfig.onConfirm}
              onCancel={() => setConfirmModalConfig(null)}
              confirmText={confirmModalConfig.confirmText}
            />
          )}

          {latestVersionInfo && (
            <UpdateModal
              isOpen={isUpdateModalOpen}
              version={latestVersionInfo.version}
              notes={latestVersionInfo.notes}
              onConfirm={handleUpdateConfirm}
              onCancel={handleUpdateCancel}
            />
          )}

          {/* Add Hotel */}
          <Modal isOpen={isAddHotelModalOpen} onClose={() => setIsAddHotelModalOpen(false)} title="Adicionar Novo Hotel">
            <div className="space-y-4">
              <div>
                <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome do Hotel
                </label>
                <input
                  type="text"
                  id="hotelName"
                  value={newHotelName}
                  onChange={(e) => setNewHotelName(e.target.value)}
                  className="input"
                  placeholder="Ex: Hotel Palace"
                />
              </div>
              <div>
                <label htmlFor="hotelAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endereço
                </label>
                <input
                  type="text"
                  id="hotelAddress"
                  value={newHotelAddress}
                  onChange={(e) => setNewHotelAddress(e.target.value)}
                  className="input"
                  placeholder="Ex: Av. Principal, 123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Principal (opcional)</label>
                <label
                  htmlFor="hotel-photo-upload"
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
                >
                  <div className="space-y-1 text-center">
                    <CameraIcon />
                    <p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar</p>
                  </div>
                  <input id="hotel-photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleHotelPhotoUpload} />
                </label>
                {newHotelPhoto && (
                  <div className="mt-2 relative w-32 h-32">
                    <button
                      onClick={() => handlePhotoClick([newHotelPhoto], 0)}
                      className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
                    >
                      <img src={newHotelPhoto} alt="Preview" className="rounded-md object-cover w-full h-full" />
                    </button>
                    <button
                      onClick={() => setNewHotelPhoto(null)}
                      className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddHotel}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                  Salvar Hotel
                </button>
              </div>
            </div>
          </Modal>

          {/* Edit Hotel */}
          <Modal isOpen={isEditHotelModalOpen} onClose={() => setIsEditHotelModalOpen(false)} title="Editar Hotel">
            <div className="space-y-4">
              <div>
                <label htmlFor="editHotelName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome do Hotel
                </label>
                <input
                  type="text"
                  id="editHotelName"
                  value={editedHotelName}
                  onChange={(e) => setEditedHotelName(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="editHotelAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Endereço
                </label>
                <input
                  type="text"
                  id="editHotelAddress"
                  value={editedHotelAddress}
                  onChange={(e) => setEditedHotelAddress(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Foto Principal (opcional)</label>
                <label
                  htmlFor="edit-hotel-photo-upload"
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
                >
                  <div className="space-y-1 text-center">
                    <CameraIcon />
                    <p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar ou alterar</p>
                  </div>
                  <input
                    id="edit-hotel-photo-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleEditedHotelPhotoUpload}
                  />
                </label>
                {editedHotelPhoto && (
                  <div className="mt-2 relative w-32 h-32">
                    <button
                      onClick={() => handlePhotoClick([editedHotelPhoto], 0)}
                      className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
                    >
                      <img src={editedHotelPhoto} alt="Preview" className="rounded-md object-cover w-full h-full" />
                    </button>
                    <button
                      onClick={() => setEditedHotelPhoto(null)}
                      className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleUpdateHotel}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </Modal>

          {/* Edit Apartment */}
          <Modal isOpen={isEditApartmentModalOpen} onClose={() => setIsEditApartmentModalOpen(false)} title="Editar Apartamento">
            <div className="space-y-4">
              <div>
                <label htmlFor="editApartmentNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número do Apartamento
                </label>
                <input
                  type="text"
                  id="editApartmentNumber"
                  value={editedApartmentNumber}
                  onChange={(e) => setEditedApartmentNumber(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="editApartmentDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição (opcional)
                </label>
                <textarea
                  id="editApartmentDescription"
                  value={editedApartmentDescription}
                  onChange={(e) => setEditedApartmentDescription(e.target.value)}
                  rows={2}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotos (opcional, máx 5)</label>
                <label
                  htmlFor="edit-apt-photo-upload"
                  className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary-400 dark:hover:border-primary-500"
                >
                  <div className="space-y-1 text-center">
                    <CameraIcon />
                    <p className="text-xs text-gray-500 dark:text-gray-500">Clique para enviar</p>
                  </div>
                  <input id="edit-apt-photo-upload" type="file" multiple accept="image/*" className="sr-only" onChange={handleEditedAptPhotoUpload} />
                </label>

                {editedApartmentPhotos.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {editedApartmentPhotos.map((photo, index) => (
                      <div key={index} className="relative">
                        <button
                          onClick={() => handlePhotoClick(editedApartmentPhotos, index)}
                          className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
                        >
                          <img src={photo} alt={`Preview ${index}`} className="rounded-md object-cover h-20 w-full" />
                        </button>
                        <button
                          onClick={() => removeEditedAptPhoto(index)}
                          className="absolute top-0 right-0 text-red-500 bg-white bg-opacity-70 rounded-full -mt-1 -mr-1 p-0.5"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveEditedApartment}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </Modal>

          {/* Add Task */}
          <Modal isOpen={isAddTaskModalOpen} onClose={() => setIsAddTaskModalOpen(false)} title="Adicionar Nova Tarefa">
            <div className="space-y-4">
              <div>
                <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título
                </label>
                <input
                  type="text"
                  id="taskTitle"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input"
                  placeholder="Ex: Limpar filtro do ar condicionado"
                />
              </div>

              <div>
                <label htmlFor="taskDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição (opcional)
                </label>
                <textarea
                  id="taskDesc"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={2}
                  className="input"
                  placeholder="Ex: Apto 101, verificar também a tubulação"
                />
              </div>

              <div>
                <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data de Vencimento
                </label>
                <input type="date" id="taskDueDate" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} className="input" />
              </div>

              <div>
                <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prioridade
                </label>
                <select
                  id="taskPriority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                  className="input"
                >
                  {Object.values(TaskPriority).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleAddTask}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg shadow-md"
                >
                  Salvar Tarefa
                </button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </IconProvider>
  );
};

export default App;
