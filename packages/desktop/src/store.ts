import Store from 'electron-store';
import type { WindowRect } from './types';

interface MainStore {
  'window-rect': WindowRect;
}

const store = new Store<MainStore>({ name: 'config.main' });

export function loadWindowRect() {
  return store.get<string, WindowRect | undefined>('window-rect');
}

export function saveWindowRect(rect: WindowRect) {
  store.set('window-rect', rect);
}
