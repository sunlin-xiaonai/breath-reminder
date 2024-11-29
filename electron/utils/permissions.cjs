const { systemPreferences } = require('electron');
const { exec } = require('child_process');

function checkMacOSPermissions() {
  return new Promise((resolve) => {
    if (process.platform !== 'darwin') {
      resolve(true);
      return;
    }

    // 检查辅助功能权限
    const accessibilityEnabled = systemPreferences.isTrustedAccessibilityClient(false);
    
    if (!accessibilityEnabled) {
      exec('open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"');
    }

    resolve(accessibilityEnabled);
  });
}

module.exports = {
  checkMacOSPermissions
}; 