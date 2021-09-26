export type Order = 'asc' | 'desc';

export interface SortSettings {
  name: string;
  isEnabled: boolean;
  position: number;
  order: Order;
}
