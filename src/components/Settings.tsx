import React, { useState, useEffect } from 'react';
import type { Settings as SettingsType } from '../hooks/useSettings';
import { Card3D } from './Card3D';
import { Bell } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType | null;
  updateSetting: (key: keyof SettingsType, value: number | boolean) => void;
}

export function Settings({ settings, updateSetting }: SettingsProps) {
  const [nextBreakTime, setNextBreakTime] = useState<string>('');

  useEffect(() => {
    const updateCountdown = async () => {
      if (!settings?.enabled) {
        setNextBreakTime('');
        return;
      }

      const now = Date.now();
      const lastBreak = await window.electron?.store.get('lastBreakTime') || now;
      const interval = settings.breakInterval * 60 * 1000;
      const nextBreak = lastBreak + interval;
      const remaining = Math.max(0, nextBreak - now);

      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        const nextBreakTime = new Date(nextBreak);
        setNextBreakTime(`${minutes}m ${seconds}s (at ${nextBreakTime.toLocaleTimeString()})`);
      } else {
        setNextBreakTime('Break time!');
      }
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, [settings]);

  if (!settings) return null;

  return (
    <Card3D>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Break Settings
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSetting('enabled', !settings.enabled)}
              className={`relative inline-flex h-8 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                settings.enabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-12' : 'translate-x-1'
                }`}
              />
              <span className="absolute left-1 text-xs font-bold text-white">
                ON
              </span>
              <span className="absolute right-2 text-xs font-bold text-white">
                OFF
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Break Interval</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0.1"
                max="60"
                step="0.1"
                value={settings.breakInterval}
                onChange={(e) => updateSetting('breakInterval', parseFloat(e.target.value))}
                className="bg-white/10 rounded-lg px-3 py-2 text-sm w-20"
              />
              <span className="text-sm opacity-60">minutes</span>
              {settings.enabled && nextBreakTime && (
                <span className="text-sm text-emerald-400 ml-4">
                  {nextBreakTime}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Break Duration</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="30"
                value={settings.breakDuration}
                onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value) || 1)}
                className="bg-white/10 rounded-lg px-3 py-2 text-sm w-20"
              />
              <span className="text-sm opacity-60">minutes</span>
            </div>
          </div>
        </div>
      </div>
    </Card3D>
  );
} 