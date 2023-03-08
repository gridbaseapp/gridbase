import Store from 'electron-store';
import type { WindowRect } from './window';

interface MainStore {
  "window-rect": WindowRect;
}

const store = new Store<MainStore>({ name: 'config.main' });

export function loadWindowRect(defaultWindowRect: WindowRect) {
  return store.get("window-rect", defaultWindowRect);
}

export function saveWindowRect(rect: WindowRect) {
  store.set("window-rect", rect);
}
