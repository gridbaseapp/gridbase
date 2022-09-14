import React from 'react';
import styles from './Splash.scss';

export function Splash() {
  return (
    <div className={styles.splash}>
      <div className={styles.panel}>
        <h1>GridBase</h1>
        <div className={styles.gridbaseLoader}>
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
        </div>
      </div>
    </div>
  );
}
