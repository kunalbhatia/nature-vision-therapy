import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
        <div className='bg-green-900 text-white px-4 py-3 flex justify-between items-center rounded-t-lg'>
          <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose} className='text-white text-xl font-bold'>
            &times;
          </button>
        </div>
        <div className='text-green-900 bg-green-500 bg-opacity-50 backdrop-blur-md p-6'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
