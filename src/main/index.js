const {
  app,
  BrowserWindow,
  screen,
  Menu,
  ipcMain,
  dialog,
} = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false;

Store.initRenderer();

const WINDOW_RECT_STORE_KEY = 'window-rect';

function createWindow() {
  const store = new Store({ name: 'config.main' });
  const screenSize = screen.getPrimaryDisplay().workAreaSize;
  const windowRect = store.get(WINDOW_RECT_STORE_KEY, {});

  const win = new BrowserWindow({
    titleBarStyle: 'hidden',
    x: windowRect.x || 0,
    y: windowRect.y || 0,
    width: windowRect.width || screenSize.width,
    height: windowRect.height || screenSize.height,
    minWidth: 800,
    minHeight: 600,
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

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  } else {
    win.loadURL(`http://localhost:8080`);
  }

  const menu = [
    {
      label: 'dbadmin',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

  ipcMain.on('export:ready', (_, arg) => {
    const defaultPath = `${os.homedir()}/Downloads/${arg.name}.${arg.format}`;

    dialog
      .showSaveDialog(win, { showsTagField: false, defaultPath })
      .then(({ filePath }) => {
        if (filePath) {
          fs.copyFileSync(arg.path, filePath);
        }
      });
  });

  ipcMain.on('autoupdater:check-for-updates', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  ipcMain.on('autoupdater:quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('autoupdater:update-available', {
      currentVersion: app.getVersion(),
      availableVersion: info.version,
    });
  });
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
