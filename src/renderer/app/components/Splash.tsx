import React, { forwardRef } from 'react';
import { animated } from '@react-spring/web';
import styles from './Splash.scss';

interface Props {
  style: React.CSSProperties;
}

const Component = forwardRef<HTMLDivElement, Props>(({ style }, ref) => {
  return (
    <div className={styles.splash}>
      <div ref={ref} style={style} className={styles.content}>
        <div className={styles.panel}>
          <h1>GridBase</h1>
          <div className={styles.gridbaseLoader}>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const Splash = animated(Component);
