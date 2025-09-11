import { createContext } from 'react';

export interface SnackbarContextType {
  showMessage: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);
