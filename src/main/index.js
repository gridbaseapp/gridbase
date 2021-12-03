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
const Store = require('electron-store');

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = false;

Store.initRenderer();

const WINDOW_RECT_STORE_KEY = 'window-rect';

function createWindow() {
  const store = new Store();
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

  win.loadFile('./src/main/index.html');

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

  ipcMain.on('export-ready', (event, arg) => {
    const defaultPath = `${os.homedir()}/Downloads/${arg.name}.${arg.format}`;
    dialog
      .showSaveDialog(win, { showsTagField: false, defaultPath })
      .then(({ filePath }) => {
        if (filePath) {
          fs.copyFileSync(arg.path, filePath);
        }
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
