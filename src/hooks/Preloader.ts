import { createContext, useContext } from 'react';
export type PreloaderContextType = {
  isLoading: boolean;
  showPreloader: () => void;
  hidePreloader: () => void;
};

export const PreloaderContext = createContext<PreloaderContextType | undefined>(undefined);
export const usePreloader = (): PreloaderContextType => {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error('usePreloader must be used within PreloaderProvider');
  }
  return context;
};
