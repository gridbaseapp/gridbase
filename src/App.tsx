import * as React from 'react';
import { useState } from 'react';
import Sidebar from 'Sidebar';
import Table from 'Table';
import styles from 'App.scss';

export default function App() {
  const [selectedTable, setSelectedTable] = useState(null);

  function clickRow(e, row) {
    e.preventDefault();
    setSelectedTable(row.name);
  }

  return (
    <div className={styles.app}>
      <Sidebar onClickRow={clickRow} />
      {selectedTable && <Table tableName={selectedTable} />}
    </div>
  );
}
