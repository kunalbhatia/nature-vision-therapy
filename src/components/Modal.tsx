import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4'>
        <div className='bg-green-900 text-white px-4 py-3 flex justify-between items-center rounded-t-lg'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='text-white text-xl font-bold'>
            &times;
          </button>
        </div>

        {/* Scrollable only if content exceeds max height */}
        <div className='overflow-y-auto max-h-[80vh] text-green-500 bg-green-500 bg-opacity-50 backdrop-blur-md p-6'>
          {children}
        </div>
      </div>
    </div>
  );
};
export default Modal;
