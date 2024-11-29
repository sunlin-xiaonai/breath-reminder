import { useState, useEffect } from 'react';

export interface Settings {
  breakInterval: number;
  breakDuration: number;
  enabled: boolean;
}

const defaultSettings: Settings = {
  breakInterval: 30,
  breakDuration: 3,
  enabled: false
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await window.electron?.store.get('settings');
        setSettings(storedSettings || defaultSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setSettings(defaultSettings);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = async (key: keyof Settings, value: number | boolean) => {
    if (!settings) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await window.electron?.store.set('settings', newSettings);
      if (key === 'enabled') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return { settings, updateSetting };
}