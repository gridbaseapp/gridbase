import { app, session, BrowserWindow } from 'electron';
import { createWindow } from './window';

app
  .whenReady()
  .then(() => {
    session
      .defaultSession
      .webRequest
      .onHeadersReceived((details, callback) => {
        const csp = app.isPackaged
          ? "default-src 'self'"
          : "default-src 'self'; style-src 'unsafe-inline'";

        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': csp,
          },
        });
      });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch((error) => {
    console.trace(error); // eslint-disable-line no-console
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
