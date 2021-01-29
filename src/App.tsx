import * as React from 'react';
import { Fragment, useState } from 'react';
import NewConnection from 'NewConnection';
import Sidebar from 'Sidebar';
import Table from 'Table';
import styles from 'App.scss';

export default function App() {
  const [connection, setConnection] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  function clickRow(e, row) {
    e.preventDefault();
    setSelectedTable(row.name);
  }

  let content = <NewConnection onConnect={setConnection} />;

  if (connection) {
    content = (
      <Fragment>
        <Sidebar connection={connection} onClickRow={clickRow} />
        {selectedTable && <Table connection={connection} tableName={selectedTable} />}
      </Fragment>
    );
  }

  return (
    <div className={styles.app}>
      {content}
    </div>
  );
}
