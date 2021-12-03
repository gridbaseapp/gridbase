import React, { useState } from 'react';
import { Context } from '../context';
import { Stash } from '../Stash';

interface Props {
  stash: Stash;
  children: React.ReactNode;
}

export function AppContext({ stash, children }: Props) {
  const [focus, setFocus] = useState<string[]>([]);
  const [exclusiveFocus, setExclusiveFocus] = useState<string[]>([]);

  const contextValue = {
    stash,
    focus,
    exclusiveFocus,
    setFocus,
    setExclusiveFocus,
  };

  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}
