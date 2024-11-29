import React from 'react';
import { Timer, Bell, BarChart, Clock, Monitor } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import { Statistics } from './components/Statistics';
import { StatusBar } from './components/StatusBar';
import { Card3D } from './components/Card3D';
import styled from 'styled-components';
import { CountdownTimer } from './components/CountdownTimer'; // Import the CountdownTimer component

function App() {
  const { settings, updateSetting } = useSettings();

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E8FFF7] to-[#B6FFE4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00894d]"></div>
      </div>
    );
  }

  return (
    <StyledWrapper className="min-h-screen bg-gradient-to-br from-[#E8FFF7] to-[#B6FFE4]">
      <div className="max-w-[1600px] mx-auto p-6">
        <header className="text-center mb-8 transform-gpu">
          <div className="flex items-center justify-center mb-4">
            <Timer className="w-16 h-16 text-[#00894d] animate-float" />
          </div>
          <h1 className="text-4xl font-bold text-[#00894d] mb-2">Break Reminder</h1>
          <p className="text-[#00894d] text-lg mb-6">Stay healthy with regular breaks</p>
          <StatusBar />
        </header>

        <div className="grid grid-cols-2 gap-8">
          <Card3D className="settings-card">
            <div className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-[#00894d]" />
                  <h2 className="text-xl font-semibold text-[#00894d]">Break Settings</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={async (e) => {
                        await updateSetting('enabled', e.target.checked);
                        if (e.target.checked) {
                          // 当开关打开时，确保重置状态
                          await window.electron?.store.set('currentState', 'INTERVAL');
                          await window.electron?.startBreakIntervalTimer();
                        } else {
                          // 当开关关闭时，清除所有计时器
                          await window.electron?.store.set('currentState', 'IDLE');
                          await window.electron?.cancelBreak();
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B6FFE4] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00894d]"></div>
                    <span className="ml-2 text-sm font-medium text-[#00894d]">
                      {settings.enabled ? 'ON' : 'OFF'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#00894d] mb-2">
                    Break Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.breakInterval}
                    onChange={(e) => updateSetting('breakInterval', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-white/10 border border-[#00894d]/20 rounded-lg text-[#00894d] focus:outline-none focus:ring-2 focus:ring-[#00894d]/50"
                    min="0.1"
                    max="120"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#00894d] mb-2">
                    Break Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.breakDuration}
                    onChange={(e) => updateSetting('breakDuration', parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/10 border border-[#00894d]/20 rounded-lg text-[#00894d] focus:outline-none focus:ring-2 focus:ring-[#00894d]/50"
                    min="1"
                    max="15"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#00894d] mb-2">
                    Next Break In
                  </label>
                  <div className="w-full px-4 py-2 bg-white/10 border border-[#00894d]/20 rounded-lg text-[#00894d]">
                    {settings.enabled ? (
                      <CountdownTimer breakInterval={settings.breakInterval} />
                    ) : (
                      <span>Timer disabled</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card3D>

          <Statistics />
        </div>

        <div className="mt-8 text-center text-sm text-[#00894d]">
          <p>Break Reminder will run in the background.</p>
          <p>You can access it anytime from the menu bar icon.</p>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .settings-card {
    backdrop-filter: blur(10px);
  }
`;

export default App;