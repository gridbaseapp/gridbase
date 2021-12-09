import React, { useState } from 'react';
import { AvailableUpdate } from '../types';
import { NewVersionModal } from './NewVersionModal';
import styles from './TitleBar.scss';

interface Props {
  availableUpdate: AvailableUpdate | null;
}

export function TitleBar({ availableUpdate }: Props) {
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);

  return (
    <div className={styles.titleBar}>
      {availableUpdate && (
        <a onClick={() => setUpdateModalVisible(true)}>
          New version is available {JSON.stringify(availableUpdate)}
        </a>
      )}

      <a>Settings</a>

      {availableUpdate && isUpdateModalVisible && (
        <NewVersionModal
          availableUpdate={availableUpdate}
          onClose={() => setUpdateModalVisible(false)}
        />
      )}
    </div>
  );
}
