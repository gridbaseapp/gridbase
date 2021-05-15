import React from 'react';
import { Service } from './App';
import styles from './Dock.scss';
import DockItem from './DockItem';

interface IDocProps {
  services: Service[];
  selectedService: Service;
  onShowLauncher(): void;
  onSelectService(service: Service): void
  onCloseService(service: Service): void;
}

export default function Dock(props: IDocProps) {
  function onShowLauncher(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onShowLauncher();
  }

  return (
    <div className={styles.dock}>
      {props.services.map(service =>
        <DockItem
          key={service.connection.uuid}
          service={service}
          selected={service === props.selectedService}
          onSelectService={props.onSelectService}
          onCloseService={props.onCloseService}
        />
      )}
      <a className={styles.newConnection} href="" onClick={onShowLauncher}>+</a>
    </div>
  );
}
