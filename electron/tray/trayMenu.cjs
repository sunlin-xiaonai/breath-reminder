const { Tray, Menu } = require('electron');
const path = require('path');
const store = require('../config/store.cjs');
const { getMainWindow } = require('../windows/mainWindow.cjs');
const { startBreakTimer, clearBreakTimer } = require('../utils/breakTimer.cjs');

let tray = null;

function createTray() {
  const nativeImage = require('electron').nativeImage;
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show App', 
      click: () => getMainWindow().show() 
    },
    { 
      label: 'Enable Breaks', 
      type: 'checkbox', 
      checked: store.get('settings')?.enabled || false,
      click: (menuItem) => {
        const settings = store.get('settings');
        store.set('settings', { ...settings, enabled: menuItem.checked });
        if (menuItem.checked) {
          startBreakTimer();
        } else {
          clearBreakTimer();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => require('electron').app.quit() 
    }
  ]);
  
  tray.setToolTip('Break Reminder');
  tray.setContextMenu(contextMenu);
  
  return tray;
}

module.exports = { createTray };