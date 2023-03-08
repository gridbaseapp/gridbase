import { screen } from 'electron';
import { loadWindowRect, saveWindowRect } from "./store";
import { BrowserWindow } from "electron";

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MIN_WINDOW_WIDTH = 800;
const MIN_WINDOW_HEIGHT = 600;

export function createWindow() {
  const { x, y, width, height } = loadWindowRect(defaultWindowRect());

  const window = new BrowserWindow({
    x,
    y,
    width,
    height,
    minWidth: MIN_WINDOW_WIDTH,
    minHeight: MIN_WINDOW_HEIGHT
  })

  window.on('close', () => {
    const [x, y] = window.getPosition();
    const [width, height] = window.getSize();

    saveWindowRect({ x: x!, y: y!, width: width!, height: height! });
  });
}

export function defaultWindowRect(): WindowRect {
  const {
    width: screenWidth,
    height: screenHeight,
  } = screen.getPrimaryDisplay().workAreaSize;

  const width = screenWidth / 2;
  const height = screenHeight / 2;

  const x = screenWidth / 2 - width / 2;
  const y = screenHeight / 2 - height / 2;

  return { x, y, width, height };
}
