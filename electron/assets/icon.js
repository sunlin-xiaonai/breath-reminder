const fs = require('fs');
const path = require('path');

// 一个简单的 16x16 的图标
const iconData = `iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGoSURBVDiNpZK9SxxBGMZ/M7t7t3vZ9U7xUNQ7EQwKFhKxEGwshPwLgYCNjWBlY2FhYZFPSBpbQbCwTKGFhZ2VhUJAMKIgST4gGhHvozF3t7szFndRQTHmgYeZGZh5nvd9Z+B/S213xsbG+oHnQC/gAAvAZBAET1pBhegHvGq1egz4BfSVSqVXwPtWgNZ6DPiQz+cHoyiKgW/AK2DhX4AQ4gPwMZPJpJVSv4wxE8Cn+4CUUhPAZynlN2PMtJTyCbDaDmitx4UQn7XWX40xM0qpJ8BaGyClnARmtNbTxphZpdRT4Pt9gNZ6XAjxJZvNfomiaNYY81xKuQ58vws0u5/L5QajKJpn/+4/tQOklBPAbD6fH4qiaAGYAqbugr9PTQgxBcwXCoXhKIp+ALPAu1ZIW0BrPQ58LRQKw+Vy+ScwA7xtt2RHEAR3bqeUmgQ+lsvlESHED+AtkLkP/mOFlmX1CiFeW5b1EjgDLgEXOAcugiC4bgYopVLAQeAYOAIOW+CiMeYmCILrv9Z4a2TbjB0HsG3bAzpd1+0ETnzfPwFOfd+/6QD+v3oD2UF5hAYE4yEAAAAASUVORK5CYII=`;

const iconPath = path.join(__dirname, 'icon.png');
const iconBuffer = Buffer.from(iconData, 'base64');
fs.writeFileSync(iconPath, iconBuffer);

module.exports = iconPath; 