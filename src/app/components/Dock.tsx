import React from 'react';
import styles from './Dock.scss';
import { DockItem } from './DockItem';
import { Service } from '../types';

interface Props {
  services: Service[];
  activeService: Service | null;
  onShowLauncher(): void;
  onActivateService(service: Service): void;
  onDisconnect(service: Service): void;
}

export function Dock({
  services,
  activeService,
  onShowLauncher,
  onActivateService,
  onDisconnect,
}: Props) {
  function handleShowLauncher(ev: React.MouseEvent) {
    ev.preventDefault();
    onShowLauncher();
  }

  return (
    <div className={styles.dock}>
      {services.map(service =>
        <DockItem
          key={service.connection.uuid}
          service={service}
          isActive={service === activeService}
          onActivateService={onActivateService}
          onDisconnect={onDisconnect}
        />
      )}
      <a className={styles.newConnection} onClick={handleShowLauncher}>+</a>
    </div>
  );
}
