import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.linkvault.app',
  appName: 'LinkVault',
  webDir: 'public',
  server: {
    // URL ini diatur untuk testing di Android Emulator
    // Ganti ke URL produksi (misal: https://domain.com) saat rilis
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
