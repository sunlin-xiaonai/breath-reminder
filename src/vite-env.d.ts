/// <reference types="vite/client" />

interface Window {
  electron?: {
    store: {
      get: (key: string) => Promise<any>;
      set: (key: string, value: any) => Promise<void>;
    };
    statistics: {
      get: () => Promise<{
        appUsageTime: Record<string, number>;
        breaksTaken: Record<string, number>;
        programUsage: Record<string, {
          duration: number;
          launches: number;
          lastActive: number;
        }>;
      }>;
    };
    getLastBreakTime: () => Promise<number>;
    getSettings: () => Promise<{
      breakInterval: number;
      breakDuration: number;
      enabled: boolean;
    }>;
    updateSettings: (settings: {
      breakInterval: number;
      breakDuration: number;
      enabled: boolean;
    }) => Promise<void>;
    initiateBreak: () => Promise<void>;
    cancelBreak: () => Promise<void>;
    startBreakIntervalTimer: () => Promise<void>;
  };
}