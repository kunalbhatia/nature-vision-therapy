// src/context/PreloaderContext.tsx
import React, { useState, useMemo } from 'react';
import { PreloaderContext } from '../hooks/Preloader';

export const PreloaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showPreloader = () => setIsLoading(true);
  const hidePreloader = () => setIsLoading(false);

  const contextValue = useMemo(
    () => ({ isLoading, showPreloader, hidePreloader }),
    [isLoading] // re-create only if isLoading changes
  );

  return <PreloaderContext.Provider value={contextValue}>{children}</PreloaderContext.Provider>;
};
