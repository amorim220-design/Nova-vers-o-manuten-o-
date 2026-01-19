import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.manutencao.app',
  appName: 'Manutenção de Apartamentos',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    LocalNotifications: {}
  }
};

export default config;
