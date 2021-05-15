import React from 'react';
import Tippy from '@tippyjs/react/headless';
import classNames from 'classnames';
import { Service } from './App';
import styles from './DockItem.scss';

interface IDocItemProps {
  service: Service;
  selected: boolean;
  onSelectService(service: Service): void;
  onCloseService(service: Service): void;
}

export default function DockItem(props: IDocItemProps) {
  function onSelectService(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onSelectService(props.service);
  }

  function onCloseService(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onCloseService(props.service);
  }

  return (
    <div>
      <Tippy
        placement="right-start"
        delay={[200, 100]}
        interactive={true}
        interactiveBorder={10}
        render={attrs => (
          <div className={styles.popover} {...attrs}>
            <div>host: {props.service.connection.host}</div>
            <div>port: {props.service.connection.port}</div>
            <div>database: {props.service.connection.database}</div>
            <div>user: {props.service.connection.user}</div>
            <div><a href="" onClick={onCloseService}>Disconnect</a></div>
          </div>
        )}
      >
        <a
          className={classNames(styles.item, { [styles.selected]: props.selected })}
          href=""
          onClick={onSelectService}
        >
          {props.service.connection.database}
        </a>
      </Tippy>
    </div>
  );
}
