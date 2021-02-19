import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Client } from 'pg';
import LocalStore from '../utils/local-store'
import { IConnectionDetails, ConnectionTypeEnum } from '../connection-details';
import styles from './NewConnection.scss';

interface INewConnectionProps {
  localStore: LocalStore;
  onClose?(): void;
}

function findExistingConnection(conns: IConnectionDetails[], conn: IConnectionDetails) {
  return conns.find((e: IConnectionDetails) => {
    return e.type === conn.type &&
           e.host === conn.host &&
           e.port === conn.port &&
           e.database === conn.database &&
           e.user === conn.user &&
           e.password === conn.password;
  });
}

export default function NewConnection(props: INewConnectionProps) {
  const [error, setError] = useState(null);
  const { errors, handleSubmit, register } = useForm<IConnectionDetails>({ mode: 'onChange' });

  async function onSubmit(data: IConnectionDetails) {
    data.type = ConnectionTypeEnum.PostgreSQL;
    const connections = props.localStore.getConnections();
    const existingConnection = findExistingConnection(connections, data);

    try {
      const client = new Client(data);
      await client.connect();

      if (!existingConnection) {
        connections.push(data);
        props.localStore.setConnections(connections);
      }

      setError(null);
//       onConnect(client);
    } catch (err) {
      setError(err.message);
    }
  }

  function onClose(ev: React.MouseEvent) {
    ev.preventDefault();
    props.onClose && props.onClose();
  }

  return (
    <div className={styles.newConnection}>
      {props.onClose && <a href="" onClick={onClose}>Close</a>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name"
            autoFocus
            ref={register}
          />
        </div>

        <div>
          <input
            type="text"
            name="host"
            placeholder="Host"
            defaultValue="localhost"
            ref={register({ required: true })}
          />
          {errors.host && 'is required'}
        </div>

        <div>
          <input
            type="number"
            name="port"
            placeholder="Port"
            defaultValue="5432"
            ref={register({ required: true })}
          />
          {errors.port && 'is required'}
        </div>

        <div>
          <input
            type="text"
            name="database"
            placeholder="Database"
            ref={register({ required: true })}
          />
          {errors.database && 'is required'}
        </div>

        <div>
          <input
            type="text"
            name="user"
            placeholder="User"
            ref={register({ required: true })}
          />
          {errors.user && 'is required'}
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            ref={register({ required: true })}
          />
          {errors.password && 'is required'}
        </div>

        <div>
          <input type="submit" value="Connect" />
        </div>

        <div className={styles.error}>{error}</div>
      </form>
    </div>
  );
}
