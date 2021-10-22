import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Connection, ConnectionStatus, Service } from '../types';
import styles from './ConnectionDetails.scss';

function getConnectionStatus(service?: Service) {
  return service ? 'connected' : 'disconnected';
}

interface Props {
  connection: Connection;
  hasFocus: boolean;
  service?: Service;
  onConnect(connection: Connection): Promise<void>;
  onDisconnect(service: Service): void;
  onDelete(connection: Connection): void;
}

export function ConnectionDetails({
  connection,
  hasFocus,
  service,
  onConnect,
  onDisconnect,
  onDelete,
}: Props) {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus(service));
  const [error, setError] = useState('');

  useEffect(() => {
    setStatus(getConnectionStatus(service));
  }, [service]);

  async function handleConnect(ev: React.MouseEvent) {
    ev.preventDefault();
    setStatus('pending');

    try {
      await onConnect(connection);
    } catch (error) {
      setStatus('error');
      setError((error as Error).message);
    }
  }

  function handleDisconnect(ev: React.MouseEvent) {
    ev.preventDefault();
    onDisconnect(service!);
  }

  function handleDelete(ev: React.MouseEvent) {
    ev.preventDefault();
    onDelete(connection);
  }

  const { name, host, port, database, user } = connection;

  let content = null;

  if (status === 'connected') {
    content = (
      <>
        <a onClick={handleDisconnect}>Disconnect</a>
        <a onClick={handleDelete}>Disconnect and Delete</a>
      </>
    );
  } else if (status === 'disconnected' || status === 'error') {
    content = (
      <>
        <a onClick={handleConnect}>Connect</a>
        <a onClick={handleDelete}>Delete</a>
        {error ? 'Error: ' + error : ''}
      </>
    );
  } else if (status === 'pending') {
    content = ' connecting...';
  }

  return (
    <div
      className={
        classNames(styles.connection, { [styles.connectionFocused]: hasFocus })
      }
    >
      {name} / {host} / {port} / {database} / {user}
      {content}
    </div>
  );
}
