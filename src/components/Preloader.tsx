// src/components/Preloader.tsx
import React from 'react';
import { usePreloader } from '../hooks/Preloader';

const Preloader: React.FC = () => {
  const { isLoading } = usePreloader();

  if (!isLoading) return null;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black/60 z-50'>
      <div className='w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></div>
    </div>
  );
};

export default Preloader;
