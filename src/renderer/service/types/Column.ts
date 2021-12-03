export type SortOrder = 'none' | 'asc' | 'desc';

interface Sort {
  position: number;
  order: SortOrder;
}

export interface Column {
  name: string;
  isVisible: boolean;
  width: number;
  sort: Sort;
}
