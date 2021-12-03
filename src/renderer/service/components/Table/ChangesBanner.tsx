import React from 'react';
import { Row } from '../../types';
import styles from './ChangesBanner.scss';

interface Props {
  rows: Row[];
  onSave(): void;
  onDiscard(): void;
}

export function ChangesBanner({ rows, onSave, onDiscard }: Props) {
  const editedCount = rows.reduce((acc, e) => acc + (e.isEdited ? 1 : 0), 0);
  const deletedCount = rows.reduce((acc, e) => acc + (e.isDeleted ? 1 : 0), 0);
  const addedCount = rows.reduce((acc, e) => acc + (e.isAdded ? 1 : 0), 0);

  return (
    <div className={styles.changesBanner}>
      <span>Changes:</span>
      {editedCount > 0 && <span>{editedCount} edited</span>}
      {deletedCount > 0 && <span>{deletedCount} deleted</span>}
      {addedCount > 0 && <span>{addedCount} added</span>}
      <a onClick={onSave}>Save</a>
      <a onClick={onDiscard}>Discard</a>
    </div>
  );
}
