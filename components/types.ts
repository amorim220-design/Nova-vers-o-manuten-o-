
export enum ItemStatus {
  OK = 'OK',
  NeedsRepair = 'Requer Reparo',
  Damaged = 'Danificado',
}

export enum TaskPriority {
  High = 'Alta',
  Medium = 'Média',
  Low = 'Baixa',
}

export type Theme = 'light' | 'dark';
export type IconStyle = 'solid' | 'outline';
export type ThemeColor = 'blue' | 'green' | 'violet' | 'rose' | 'orange' | 'slate';

export interface ScheduledTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  isComplete: boolean;
  notificationSent?: boolean;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  notes: string;
  photos: string[]; // Array of base64 strings
  itemId: string;
}

export interface Item {
  id: string;
  name: string;
  status: ItemStatus;
  photos?: string[]; // Array of base64 strings
}

export interface Apartment {
  id: string;
  number: string;
  description?: string;
  items: Item[];
  maintenanceLogs: MaintenanceLog[];
  photos?: string[]; // Array of base64 strings
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  apartments: Apartment[];
  photo?: string; // Single base64 string for the main photo
}

export interface AppData {
    userName: string;
    hotels: Hotel[];
    scheduledTasks: ScheduledTask[];
}