const { app, BrowserWindow, screen, powerSaveBlocker, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const store = require('./config/store.cjs');
const { createTray } = require('./tray/trayMenu.cjs');
const { updateAppUsageTime, updateProgramUsage, recordAppLaunch, getStatistics } = require('./utils/statistics.cjs');
const { checkMacOSPermissions } = require('./utils/permissions.cjs');
const { startBreakTimer, clearBreakTimer, initiateBreak, setupPowerMonitor, cancelBreak, showNotification, startBreakIntervalTimer } = require('./utils/breakTimer.cjs');
const { dialog } = require('electron');

let mainWindow = null;
let powerSaveBlockerId = null;
let statsInterval = null;

// Setup IPC handlers
function setupIPC() {
  ipcMain.handle('store:get', (_, key) => store.get(key));
  ipcMain.handle('store:set', (_, key, value) => store.set(key, value));
  ipcMain.handle('statistics:get', () => store.get('statistics'));
  ipcMain.handle('get-last-break-time', () => store.get('lastBreakTime'));
  ipcMain.handle('get-settings', () => store.get('settings'));
  ipcMain.handle('update-settings', (_, newSettings) => {
    store.set('settings', newSettings);
    if (newSettings.enabled) {
      startBreakIntervalTimer();
    } else {
      clearAllTimers();
      store.set('currentState', 'IDLE');
    }
  });
  ipcMain.handle('initiate-break', () => showNotification());
  ipcMain.handle('cancel-break', () => cancelBreak());
  ipcMain.handle('start-break-interval', () => {
    startBreakIntervalTimer();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    frame: true,
    backgroundColor: '#ffffff',
    movable: true,
    resizable: true,
    show: false,
    center: true,
    minWidth: 1200,
    minHeight: 800
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Hide window instead of closing when user clicks the close button
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Record app launch
  recordAppLaunch('Break Reminder');

  // For debugging
  mainWindow.webContents.on('crashed', (event) => {
    console.error('Window crashed:', event);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });
  return mainWindow;
}

function createBreakWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('break.html');
  return win;
}

function createWindow() {
  mainWindow = createMainWindow();
  createTray(mainWindow);
  setupIPC();
  setupPowerMonitor();
  startBreakTimer(false); // 初始启动时使用完整间隔
}

// Start collecting statistics
function startStatisticsCollection() {
  statsInterval = setInterval(() => {
    updateAppUsageTime();
    updateProgramUsage();
  }, 60000); // Update every minute
}

app.whenReady().then(async () => {
  try {
    // 确保设置正确初始化
    const settings = store.get('settings');
    if (!settings) {
      store.set('settings', {
        breakInterval: 1,
        breakDuration: 1,
        enabled: false
      });
    }

    createWindow();

    // 检查权限
    const hasPermissions = await checkMacOSPermissions();
    if (!hasPermissions) {
      dialog.showMessageBox({
        type: 'info',
        title: '欢迎使用',
        message: '此应用需要系统权限',
        detail: '为了实现自动休眠功能，需要您授予辅助功能权限。\n请在弹出的系统设置中勾选此应用。',
        buttons: ['好的']
      });
    }

    startStatisticsCollection();
    // 只在启用时启动计时器
    if (settings?.enabled) {
      startBreakTimer(false); // 确保使用完整间隔
    }
  } catch (error) {
    console.error('Application startup error:', error);
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Clean up before quitting
app.on('before-quit', () => {
  app.isQuitting = true;
  if (statsInterval) {
    clearInterval(statsInterval);
  }
});