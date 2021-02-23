import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { v4 as uuid } from 'uuid';
import { IConnectionDetails, ConnectionTypeEnum } from '../connection';
import styles from './NewConnection.scss';

interface INewConnectionProps {
  connectionsDetails: IConnectionDetails[];
  onCreateConnectionDetails(details: IConnectionDetails): Promise<void>;
  onClose(): void;
}

export default function NewConnection(props: INewConnectionProps) {
  const [error, setError] = useState(null);
  const { errors, handleSubmit, register } = useForm<IConnectionDetails>({ mode: 'onChange' });

  async function onSubmit(data: IConnectionDetails) {
    try {
      setError(null);

      data.uuid = uuid();
      data.type = ConnectionTypeEnum.PostgreSQL;

      await props.onCreateConnectionDetails(data);
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
      {props.connectionsDetails.length > 0 && <a href="" onClick={onClose}>Close</a>}

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
