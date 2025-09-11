import React, { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const bgColor = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-700',
};

const Snackbar: React.FC<SnackbarProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 left-4 z-50 px-4 py-2 text-white rounded shadow-lg ${bgColor[type]}`}>
      {message}
    </div>
  );
};

export default Snackbar;
