import { app, BrowserWindow, Tray, Menu, screen, powerSaveBlocker } from 'electron';
import path from 'path';
import Store from 'electron-store';

const store = new Store();
let mainWindow;
let tray;
let breakTimer;
let powerSaveBlockerId;

// Initialize default settings if not exists
if (!store.get('settings')) {
  store.set('settings', {
    breakInterval: 30, // minutes
    breakDuration: 3,  // minutes
    enabled: true
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile('dist/index.html');
  }
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Enable Breaks', type: 'checkbox', checked: store.get('settings.enabled'), 
      click: (menuItem) => {
        store.set('settings.enabled', menuItem.checked);
        if (menuItem.checked) {
          startBreakTimer();
        } else {
          clearTimeout(breakTimer);
        }
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  
  tray.setToolTip('Break Reminder');
  tray.setContextMenu(contextMenu);
}

function startBreakTimer() {
  const settings = store.get('settings');
  if (!settings.enabled) return;

  clearTimeout(breakTimer);
  breakTimer = setTimeout(() => {
    initiateBreak();
  }, settings.breakInterval * 60 * 1000);
}

function initiateBreak() {
  const settings = store.get('settings');
  
  // Create a fullscreen window on each display
  screen.getAllDisplays().forEach(display => {
    const breakWindow = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      fullscreen: true,
      alwaysOnTop: true,
      frame: false,
      webPreferences: {
        nodeIntegration: true
      }
    });

    breakWindow.loadURL(`file://${__dirname}/break.html`);
  });

  // Prevent system sleep during break
  powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');

  // End break after duration
  setTimeout(() => {
    BrowserWindow.getAllWindows().forEach(window => {
      if (window !== mainWindow) {
        window.close();
      }
    });
    powerSaveBlocker.stop(powerSaveBlockerId);
    startBreakTimer();
  }, settings.breakDuration * 60 * 1000);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  startBreakTimer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});