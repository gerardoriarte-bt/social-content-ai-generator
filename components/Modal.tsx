import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg transform rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8">
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
              {title}
            </h3>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {!title && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-600"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className={title ? "p-6 pt-5" : "p-6"}>
          {children}
        </div>
      </div>
    </div>
  );
};