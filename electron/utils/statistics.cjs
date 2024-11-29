const store = require('../config/store.cjs');
const { exec } = require('child_process');
const os = require('os');
const platform = os.platform();

function getFormattedDate() {
  return new Date().toISOString().split('T')[0];
}

function updateAppUsageTime() {
  const today = getFormattedDate();
  const stats = store.get('statistics') || {};
  
  if (!stats.appUsageTime[today]) {
    stats.appUsageTime[today] = 0;
  }
  
  stats.appUsageTime[today] += 1; // Increment by 1 minute
  store.set('statistics', stats);
}

function recordBreakTaken() {
  const today = getFormattedDate();
  const stats = store.get('statistics') || {};
  
  if (!stats.breaksTaken[today]) {
    stats.breaksTaken[today] = 0;
  }
  
  stats.breaksTaken[today] += 1;
  store.set('statistics', stats);
}

function getActiveWindow() {
  return new Promise((resolve) => {
    if (platform === 'darwin') {
      exec('osascript -e \'tell application "System Events" to get name of first application process whose frontmost is true\'', (error, stdout) => {
        if (error) {
          resolve('Unknown');
        } else {
          resolve(stdout.trim());
        }
      });
    } else {
      resolve('Unknown'); // Default for unsupported platforms
    }
  });
}

function updateProgramUsage() {
  return new Promise((resolve) => {
    getActiveWindow().then(activeApp => {
      if (activeApp === 'Unknown') return resolve();

      const stats = store.get('statistics') || {
        appUsageTime: {},
        breaksTaken: {},
        programUsage: {}
      };
      
      const now = Date.now();
      
      if (!stats.programUsage[activeApp]) {
        stats.programUsage[activeApp] = {
          duration: 0,
          launches: 1,
          lastActive: now
        };
      } else {
        // Update duration
        stats.programUsage[activeApp].duration += 1;
        // Update last active timestamp
        stats.programUsage[activeApp].lastActive = now;
      }
      
      store.set('statistics', stats);
      resolve();
    });
  });
}

function recordAppLaunch(appName) {
  const stats = store.get('statistics') || {
    appUsageTime: {},
    breaksTaken: {},
    programUsage: {}
  };
  
  if (!stats.programUsage[appName]) {
    stats.programUsage[appName] = {
      duration: 0,
      launches: 1,
      lastActive: Date.now()
    };
  } else {
    stats.programUsage[appName].launches += 1;
  }
  
  store.set('statistics', stats);
}

function getStatistics() {
  return store.get('statistics') || {
    appUsageTime: {},
    breaksTaken: {},
    programUsage: {}
  };
}

module.exports = {
  updateAppUsageTime,
  recordBreakTaken,
  updateProgramUsage,
  recordAppLaunch,
  getStatistics
};