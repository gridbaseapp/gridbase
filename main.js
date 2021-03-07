const { app, BrowserWindow } = require('electron');
const Store = require('electron-store');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false;

Store.initRenderer();

function createWindow () {
  const win = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

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
