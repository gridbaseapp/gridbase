import { screen, BrowserWindow } from 'electron';
import { loadWindowRect, saveWindowRect } from "./store";

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_WINDOW_WIDTH = 1024;
const MIN_WINDOW_HEIGHT = 768;

function getCenter(outerPoint: number, innerPoint: number) {
  return outerPoint / 2 - innerPoint / 2;
}

function primaryScreenRect() {
  return screen.getPrimaryDisplay().workArea;
}

function defaultWindowRect(): WindowRect {
  const { width: screenWidth, height: screenHeight } = primaryScreenRect();

  const width = Math.max(screenWidth / 2, MIN_WINDOW_WIDTH);
  const height = Math.max(screenHeight / 2, MIN_WINDOW_HEIGHT);

  const x = getCenter(screenWidth, width);
  const y = getCenter(screenHeight, height);

  return { x, y, width, height };
}

export function createWindow() {
  const { x, y, width, height } = loadWindowRect() || defaultWindowRect();

  const window = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT,
  });

  window.on('close', () => {
    saveWindowRect(window.getBounds());
  });
}
