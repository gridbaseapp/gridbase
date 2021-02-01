import React, { useState } from 'react';
import Sidebar from 'Sidebar';
import Table from 'Table';
import classNames from 'classnames';
import styles from 'Content.scss';

export default function App({ active, connection }) {
  const [selectedTable, setSelectedTable] = useState(null);

  function clickRow(e, row) {
    e.preventDefault();
    setSelectedTable(row.name);
  }

  return (
    <div className={classNames(styles.content, { [styles.hidden]: !active })}>
      <Sidebar connection={connection} onClickRow={clickRow} />
      {selectedTable && <Table connection={connection} tableName={selectedTable} />}
    </div>
  );
}
