import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SnackbarProvider } from './providers/SnackbarProvider.tsx';
import { PreloaderProvider } from './context/PreloaderContext.tsx';
import Preloader from './components/Preloader.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreloaderProvider>
      <SnackbarProvider>
        <App />
        <Preloader />
      </SnackbarProvider>
    </PreloaderProvider>
  </StrictMode>
);
