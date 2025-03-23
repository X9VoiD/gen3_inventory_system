import React, { useState } from 'react';
import { createSupplier, CreateSupplierPayload } from '../api/suppliers';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => Promise<void>;
}

const AddSupplierModal: React.FC<AddSupplierModalProps> = ({ isOpen, onClose, refetch }) => {
  const [formData, setFormData] = useState<CreateSupplierPayload>({
    name: '',
    contact_info: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const { authToken } = useAuth();

  const { addNotification } = useNotification();

  const handleAdd = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot create supplier.");
      }
      const newSupplier = await createSupplier(authToken, formData);
      addNotification(`Supplier "${newSupplier.name}" created successfully!`, 'success');
      onClose();
      await refetch();
    } catch (error: any) {
      console.error("Failed to create supplier:", error);
      addNotification(`Failed to create supplier: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const modifiedOnClose = () => {
    setFormData({
      name: '',
      contact_info: ''
    });
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={modifiedOnClose}>
          <div className="absolute inset-0 bg-ashley-gray-12 opacity-75"></div>
        </div>

        <div className="bg-ashley-background rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="bg-ashley-background px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-ashley-gray-12" id="modal-title">
                  Add Supplier
                </h3>
                <div className="mt-2">
                  <form>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-ashley-gray-12 text-sm font-bold mb-2">
                        Name:
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="contact_info" className="block text-ashley-gray-12 text-sm font-bold mb-2">
                        Contact Info:
                      </label>
                      <textarea
                        id="contact_info"
                        className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
                        value={formData.contact_info}
                        onChange={handleChange}
                      />
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-ashley-gray-1 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ashley-gray-9 text-base font-medium text-ashley-accent-1 hover:bg-ashley-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-gray-8 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleAdd}
            >
              Add
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-ashley-gray-6 shadow-sm px-4 py-2 bg-ashley-background text-base font-medium text-ashley-gray-12 hover:bg-ashley-gray-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-accent-8 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={modifiedOnClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSupplierModal;
