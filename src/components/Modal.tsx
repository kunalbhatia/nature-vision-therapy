import React, { useEffect, useRef } from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Close modal if clicked outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
      onClick={handleBackdropClick}
    >
      <div ref={modalRef} className='bg-white rounded-lg shadow-lg mx-4'>
        <div className='bg-green-900 text-white px-4 py-3 flex justify-between items-center rounded-t-lg'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='text-white text-xl font-bold'>
            &times;
          </button>
        </div>

        <div className='overflow-y-auto max-h-[80vh] text-green-500 bg-green-500 bg-opacity-50 backdrop-blur-md p-6'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
