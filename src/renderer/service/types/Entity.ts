import { EntityType  } from './EntityType';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  schemaId: string;
  canSelect: boolean;
  status: 'fresh' | 'new' | 'unsaved';
}
