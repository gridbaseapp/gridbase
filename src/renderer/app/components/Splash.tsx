import React, { forwardRef } from 'react';
import { animated } from '@react-spring/web';
import css from './Splash.scss';

interface Props {
  style: React.CSSProperties;
}

const Component = forwardRef<HTMLDivElement, Props>(({ style }, ref) => {
  return (
    <div ref={ref} style={style} className={css.splash}>
      <div className={css.panel}>
        <h1>GridBase</h1>
        <div className={css.gridbaseLoader}>
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
          <div></div><div></div><div></div>
        </div>
      </div>
    </div>
  );
});

export const Splash = animated(Component);
