import React, { useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import styles from './SchemaSelector.scss';
import { useServiceContext } from '../../hooks';
import { SchemaSelectorDropdown } from './SchemaSelectorDropdown';

export function SchemaSelector() {
  const { activeSchema } = useServiceContext();

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  function handleToggleDropdown(ev: React.MouseEvent) {
    ev.preventDefault();
    setDropdownVisible(state => !state);
  }

  function hideDropwdown() {
    setDropdownVisible(false);
  }

  return (
    <div className={styles.schemaSelector}>
      <Tippy
        placement="bottom"
        interactive
        visible={isDropdownVisible}
        onClickOutside={hideDropwdown}
        render={() =>
          isDropdownVisible && <SchemaSelectorDropdown onClose={hideDropwdown} />
        }
      >
        <a className={styles.schemaSelect} onClick={handleToggleDropdown}>
          {activeSchema!.name}
        </a>
      </Tippy>
    </div>
  );
}
