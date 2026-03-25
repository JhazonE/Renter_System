const electron = require('electron');
console.log('electron type:', typeof electron);
console.log('electron keys:', Object.keys(electron));
console.log('electron app:', electron.app);
if (electron.app) {
  console.log('isPackaged:', electron.app.isPackaged);
  electron.app.quit();
} else {
  process.exit(1);
}
