const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  store: {
    get: (key) => ipcRenderer.invoke('store:get', key),
    set: (key, value) => ipcRenderer.invoke('store:set', key, value)
  },
  statistics: {
    get: () => ipcRenderer.invoke('statistics:get')
  },
  getLastBreakTime: () => ipcRenderer.invoke('get-last-break-time'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (newSettings) => ipcRenderer.invoke('update-settings', newSettings),
  initiateBreak: () => ipcRenderer.invoke('initiate-break'),
  cancelBreak: () => ipcRenderer.invoke('cancel-break'),
  startBreakIntervalTimer: () => ipcRenderer.invoke('start-break-interval')
});