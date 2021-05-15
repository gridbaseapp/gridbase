import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { v4 as uuid } from 'uuid';
import { IConnection, ServiceType } from '../connection';
import styles from './NewConnection.scss';

interface INewConnectionProps {
  connections: IConnection[];
  onCreateConnection(connection: IConnection): Promise<void>;
  onClose(): void;
}

export default function NewConnection(props: INewConnectionProps) {
  const [error, setError] = useState(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<IConnection>({ mode: 'onChange' });

  async function onSubmit(data: IConnection) {
    try {
      setError(null);

      data.uuid = uuid();
      data.type = ServiceType.PostgreSQL;

      await props.onCreateConnection(data);
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
      {props.connections.length > 0 && <a href="" onClick={onClose}>Close</a>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="text"
            placeholder="Name"
            autoFocus
            {...register('name')}
          />
        </div>

        <div>
          <input
            type="text"
            placeholder="Host"
            defaultValue="localhost"
            {...register('host', { required: true })}
          />
          {errors.host && 'is required'}
        </div>

        <div>
          <input
            type="number"
            placeholder="Port"
            defaultValue="5432"
            {...register('port', { required: true })}
          />
          {errors.port && 'is required'}
        </div>

        <div>
          <input
            type="text"
            placeholder="Database"
            {...register('database', { required: true })}
          />
          {errors.database && 'is required'}
        </div>

        <div>
          <input
            type="text"
            placeholder="User"
            {...register('user', { required: true })}
          />
          {errors.user && 'is required'}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...register('password', { required: true })}
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
