const { powerSaveBlocker, powerMonitor } = require('electron');
const { exec } = require('child_process');
const store = require('../config/store.cjs');
const { createBreakWindow } = require('../windows/breakWindow.cjs');
const { getMainWindow } = require('../windows/mainWindow.cjs');
const { checkMacOSPermissions } = require('./permissions.cjs');
const { dialog } = require('electron');

// 计时器状态枚举
const TimerState = {
  IDLE: 'IDLE',           // 空闲状态
  INTERVAL: 'INTERVAL',   // 间隔计时中
  NOTIFY: 'NOTIFY',       // 10s通知中
  BREAK: 'BREAK'          // 休息中
};

let currentState = TimerState.IDLE;
let breakIntervalTimer = null;
let notificationTimer = null;
let breakDurationTimer = null;
let breakWindow = null;

function logStateChange(previousState, newState) {
  console.log(`[State Change] From ${previousState} to ${newState}`);
}

function updateState(newState) {
  logStateChange(currentState, newState);
  currentState = newState;
  store.set('currentState', newState);
}

function clearAllTimers() {
  console.log('[Timer] Clearing all timers, current state:', currentState);
  
  if (breakIntervalTimer) {
    clearTimeout(breakIntervalTimer);
    breakIntervalTimer = null;
  }
  
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  
  if (breakDurationTimer) {
    clearTimeout(breakDurationTimer);
    breakDurationTimer = null;
  }

  // 如果当前有通知窗口，关闭它
  if (breakWindow) {
    breakWindow.close();
    breakWindow = null;
  }
}

function startBreakIntervalTimer() {
  const settings = store.get('settings');
  if (!settings?.enabled) {
    console.log('[Timer] Timer disabled, not starting');
    return;
  }

  if (currentState !== TimerState.IDLE) {
    console.log('[Timer] Invalid state for starting interval:', currentState);
    return;
  }

  clearAllTimers();
  updateState(TimerState.INTERVAL);
  
  // 获取设置值并确保有效
  console.log('[Timer] Current settings:', settings);
  const intervalInSeconds = settings.breakInterval === 0
    ? 6  // 默认6秒
    : settings.breakInterval * 60;  // 将分钟转换为秒
  
  console.log('[Timer] Starting interval timer:', {
    seconds: intervalInSeconds,
    state: currentState
  });

  breakIntervalTimer = setTimeout(() => {
    if (currentState === TimerState.INTERVAL) {
      showNotification();
    }
  }, intervalInSeconds * 1000);
}

function startBreakTimer(usePartialInterval = true) {
  const settings = store.get('settings');
  if (!settings?.enabled) {
    console.log('[Timer] Timer disabled, not starting');
    return;
  }

  if (currentState !== TimerState.IDLE) {
    console.log('[Timer] Invalid state for starting break timer:', currentState);
    return;
  }

  clearAllTimers();
  store.set('currentState', TimerState.INTERVAL);
  updateState(TimerState.INTERVAL);

  // 计算等待时间：如果间隔设置为0，则使用6秒，否则使用设置的分钟数转换为秒
  const waitTimeInSeconds = settings.breakInterval === 0 
    ? 6  // 默认6秒
    : settings.breakInterval * 60;  // 将分钟转换为秒
  
  console.log('[Timer] Starting break timer:', {
    waitTimeInSeconds,
    state: currentState,
    originalInterval: settings.breakInterval
  });

  breakIntervalTimer = setTimeout(() => {
    if (currentState === TimerState.INTERVAL) {
      showNotification();
    }
  }, waitTimeInSeconds * 1000);
}

function showNotification() {
  if (currentState !== TimerState.INTERVAL) {
    console.log('[Timer] Invalid state for notification:', currentState);
    return;
  }

  console.log('[Break] Showing notification window');
  breakWindow = createBreakWindow();
  updateState(TimerState.NOTIFY);

  notificationTimer = setTimeout(() => {
    if (currentState === TimerState.NOTIFY && breakWindow) {
      startBreakDuration();
    }
  }, 10000);

  breakWindow.on('closed', () => {
    if (currentState === TimerState.NOTIFY) {
      console.log('[Break] User cancelled notification');
      if (notificationTimer) {
        clearTimeout(notificationTimer);
        notificationTimer = null;
      }
      breakWindow = null;
      
      // 先重置状态为 IDLE
      updateState(TimerState.IDLE);
      
      // 延迟一小段时间后再启动新的计时器，确保状态已经完全重置
      setTimeout(() => {
        console.log('[Break] Restarting break timer after cancel');
        startBreakTimer();
      }, 100);
    }
  });
}

function wakeScreen() {
  return new Promise((resolve, reject) => {
    // 1. 先尝试使用 caffeinate 命令唤醒
    exec('caffeinate -u -t 1', (error) => {
      if (error) {
        console.error('[Break] Failed to wake with caffeinate:', error);
        
        // 2. 如果 caffeinate 失败，尝试使用 pmset 命令
        exec('pmset -g assertions', (err, stdout) => {
          if (err) {
            console.error('[Break] Failed to check power assertions:', err);
            reject(err);
            return;
          }
          
          // 3. 使用 powerSaveBlocker 作为备选方案
          try {
            const id = powerSaveBlocker.start('prevent-display-sleep');
            console.log('[Break] PowerSaveBlocker started with ID:', id);
            
            // 短暂阻止休眠后释放
            setTimeout(() => {
              if (powerSaveBlocker.isStarted(id)) {
                powerSaveBlocker.stop(id);
                console.log('[Break] PowerSaveBlocker stopped');
              }
              resolve();
            }, 2000);
          } catch (e) {
            console.error('[Break] Failed to use powerSaveBlocker:', e);
            reject(e);
          }
        });
      } else {
        console.log('[Break] Successfully woke screen with caffeinate');
        resolve();
      }
    });
  });
}

function startBreakDuration() {
  if (currentState !== TimerState.NOTIFY) {
    console.log('[Break] Invalid state for starting break duration:', currentState);
    return;
  }

  clearAllTimers();
  
  // 关闭通知窗口
  if (breakWindow) {
    breakWindow.close();
    breakWindow = null;
  }

  updateState(TimerState.BREAK);

  const settings = store.get('settings');
  const breakDurationMinutes = settings.breakDuration || 0.1;  // 默认6秒
  const breakDurationMs = breakDurationMinutes * 60 * 1000;

  console.log('[Break] Starting break duration:', {
    minutes: breakDurationMinutes,
    ms: breakDurationMs,
    state: currentState
  });

  // 休眠屏幕
  try {
    exec('pmset displaysleepnow', (error) => {
      if (error) {
        console.error('[Break] Failed to sleep display:', error);
      } else {
        console.log('[Break] Display sleep command sent');
      }
    });
  } catch (error) {
    console.error('[Break] Failed to execute sleep command:', error);
  }

  breakDurationTimer = setTimeout(async () => {
    if (currentState === TimerState.BREAK) {
      console.log('[Break] Break duration finished, attempting to wake screen');
      
      try {
        await wakeScreen();
        console.log('[Break] Screen wake sequence completed');
      } catch (error) {
        console.error('[Break] Failed to wake screen:', error);
      }

      // 重置状态并开始新的计时
      clearAllTimers();
      updateState(TimerState.IDLE);
      startBreakTimer();
    }
  }, breakDurationMs);
}

function cancelBreak() {
  console.log('[Break] Cancel requested, current state:', currentState);
  
  clearAllTimers();
  
  if (breakWindow) {
    breakWindow.close();
    breakWindow = null;
  }
  
  // 重置状态为 IDLE
  updateState(TimerState.IDLE);
  
  // 只有在设置启用的情况下才重新启动计时器
  const settings = store.get('settings');
  if (settings?.enabled) {
    setTimeout(() => {
      console.log('[Break] Restarting break timer after cancel');
      startBreakTimer();
    }, 100);
  } else {
    console.log('[Break] Timer disabled, not restarting');
  }
}

// 其他辅助函数保持不变
async function sleepComputer() {
  const hasPermissions = await checkMacOSPermissions();
  
  if (!hasPermissions) {
    dialog.showMessageBox({
      type: 'info',
      title: '需要权限',
      message: '需要辅助功能权限来控制系统休眠',
      detail: '请在系统偏好设置 > 安全性与隐私 > 隐私 > 辅助功能中授权此应用。\n授权后请重新启动应用。',
      buttons: ['好的']
    });
    return;
  }

  if (process.platform === 'darwin') {
    exec('pmset sleepnow');
  }
}

function wakeComputer() {
  if (process.platform === 'darwin') {
    exec('caffeinate -u -t 1 && osascript -e \'tell application "System Events" to key code 123\'');
  }
}

function checkWakeup() {
  const wakeupTime = store.get('wakeupTime');
  if (!wakeupTime) return;

  const now = Date.now();
  if (now >= wakeupTime) {
    console.log(`[Break] Break complete, waking up at ${new Date().toLocaleTimeString()}`);
    wakeComputer();
    store.delete('wakeupTime');
    clearAllTimers();
    startBreakIntervalTimer();
  }
}

function setupPowerMonitor() {
  powerMonitor.on('resume', () => {
    console.log('[Power] System resumed');
    checkWakeup();
  });

  powerMonitor.on('suspend', () => {
    console.log('[Power] System suspended');
    clearAllTimers();
  });
}

module.exports = {
  startBreakIntervalTimer,
  startBreakTimer,
  clearAllTimers,
  cancelBreak,
  setupPowerMonitor,
  showNotification
};