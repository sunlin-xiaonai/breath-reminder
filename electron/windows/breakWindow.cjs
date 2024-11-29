const { BrowserWindow, screen } = require('electron');
const path = require('path');

function createBreakWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  const window = new BrowserWindow({
    width: 400,
    height: 300,
    x: Math.floor(width / 2 - 200),
    y: Math.floor(height / 2 - 150),
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.cjs')
    }
  });

  window.loadFile(path.join(__dirname, '../../break.html'));
  
  return window;
}

module.exports = {
  createBreakWindow
};