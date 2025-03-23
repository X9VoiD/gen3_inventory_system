import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: () => void;
  submitButtonText?: string;
  cancelButtonText?: string;
  showActions?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitButtonText = "Submit",
  cancelButtonText = "Cancel",
  showActions = true
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-ashley-gray-12 opacity-75"></div>
        </div>

        <div className="mt-8 mb-8 bg-ashley-background rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="bg-ashley-background px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-ashley-gray-12" id="modal-title">
                  {title}
                </h3>
                <div className="mt-2">
                  {children}
                </div>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="bg-ashley-gray-1 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ashley-gray-9 text-base font-medium text-ashley-accent-1 hover:bg-ashley-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-gray-8 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onSubmit}
              >
                {submitButtonText}
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-ashley-gray-6 shadow-sm px-4 py-2 bg-ashley-background text-base font-medium text-ashley-gray-12 hover:bg-ashley-gray-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-accent-8 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {cancelButtonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
