import React, { useState, useCallback, useMemo } from 'react';
import Snackbar from '../components/Snackbar';
import { SnackbarContext } from '../context/SnackbarContext';

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const showMessage = useCallback((msg: string, msgType: typeof type = 'info') => {
    setMessage(msg);
    setType(msgType);
  }, []);

  const contextValue = useMemo(() => ({ showMessage }), [showMessage]);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      {message && <Snackbar message={message} type={type} onClose={() => setMessage('')} />}
    </SnackbarContext.Provider>
  );
};
