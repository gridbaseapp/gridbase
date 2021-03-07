const { app, BrowserWindow, screen } = require('electron');
const Store = require('electron-store');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false;

Store.initRenderer();

const WINDOW_RECT_STORE_KEY = 'window-rect';

function createWindow() {
  const store = new Store();
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const windowRect = store.get(WINDOW_RECT_STORE_KEY, {});

  const win = new BrowserWindow({
    titleBarStyle: 'hiddenInset',
    x: windowRect.x || 0,
    y: windowRect.y || 0,
    width: windowRect.width || screenSize.width,
    height: windowRect.height || screenSize.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.on('close', () => {
    const [x, y] = win.getPosition();
    const [width, height] = win.getSize();

    store.set(WINDOW_RECT_STORE_KEY, { x, y, width, height });
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
