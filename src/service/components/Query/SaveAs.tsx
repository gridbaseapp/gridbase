import React, { useState } from 'react';
import styles from './SaveAs.scss';

interface Props {
  onSave(value: string): void;
}

export function SaveAs({ onSave }: Props) {
  const [value, setValue] = useState('');

  function handleChange(ev: React.ChangeEvent<HTMLInputElement>) {
    setValue(ev.target.value);
  }

  return (
    <div className={styles.saveAs}>
      <input type="text" value={value} onChange={handleChange} />
      <a onClick={() => onSave(value)}>save</a>
    </div>
  );
}
