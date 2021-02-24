import React, { useState } from 'react';
import NewConnection from './NewConnection';
import styles from './Launcher.scss'
import { IConnectionDetails } from '../connection';

interface ILauncherProps {
  connectionsDetails: IConnectionDetails[];
  openConnectionsDetails: IConnectionDetails[];
  onCreateConnectionDetails(details: IConnectionDetails): Promise<void>;
  onDeleteConnectionDetails(details: IConnectionDetails): void;
  onConnect(details: IConnectionDetails): Promise<void>;
  onClose(): void;
}

export default function Launcher(props: ILauncherProps) {
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [error, setError] = useState();

  function onDeleteConnectionDetails(ev: React.MouseEvent, details: IConnectionDetails) {
    ev.preventDefault();
    props.onDeleteConnectionDetails(details);
  }

  async function onConnect(ev: React.MouseEvent, details: IConnectionDetails) {
    ev.preventDefault();

    try {
      await props.onConnect(details);
    } catch(err) {
      setError(err.message);
    }
  }

  function onNewConnection(ev: React.MouseEvent) {
    ev.preventDefault();
    setShowNewConnection(true);
  }

  function onClose(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onClose();
  }

  const list = props.connectionsDetails.map((details) => {
    const open = props.openConnectionsDetails.find(e => e === details);

    return (
      <div className={styles.connection} key={details.uuid}>
        {details.name} / {details.host} / {details.port} / {details.database} / {details.user}
        {!open && <a
          href=""
          onClick={(ev) => onConnect(ev, details)}
        >Connect</a>}
        {!open && <a
          href=""
          onClick={(ev) => onDeleteConnectionDetails(ev, details)}
        >Delete</a>}
      </div>
    );
  });

  return (
    <div className={styles.launcher}>
      {(props.connectionsDetails.length === 0 || showNewConnection) && <NewConnection
        connectionsDetails={props.connectionsDetails}
        onCreateConnectionDetails={props.onCreateConnectionDetails}
        onClose={() => setShowNewConnection(false)}
      />}

      {props.openConnectionsDetails.length > 0 && <a href="" onClick={onClose}>Close</a>}

      <div className={styles.connection}>
        <a href="" onClick={onNewConnection}>new connection</a>
      </div>

      {list}

      <div className={styles.error}>{error}</div>
    </div>
  );
}
