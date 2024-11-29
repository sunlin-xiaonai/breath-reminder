const Store = require('electron-store');

const store = new Store();

// Initialize default settings if not exists
if (!store.get('settings')) {
  store.set('settings', {
    breakInterval: 0.1,  // 改为0.1分钟，即6秒
    breakDuration: 0.1,  // 改为0.5分钟，即30秒
    enabled: false
  });
}

// Initialize statistics if not exists
if (!store.get('statistics')) {
  store.set('statistics', {
    appUsageTime: {},  // Store daily usage time
    breaksTaken: {},   // Store breaks taken per day
    programUsage: {},  // Store program usage statistics
  });
}

module.exports = store;