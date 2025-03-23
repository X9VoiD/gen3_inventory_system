import React, { useState } from 'react';
import { createSupplier, CreateSupplierPayload } from '../api/suppliers';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import useErrorNotifier from '../hooks/useErrorNotifier';
import Modal from './ui/modal';

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
  const { reportError } = useErrorNotifier();

  const handleAdd = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot create supplier.");
      }
      const newSupplier = await createSupplier(authToken, formData);
      addNotification(`Supplier "${newSupplier.name}" created successfully!`, 'success');
      onClose();
      await refetch();
    } catch (error) {
      reportError('create supplier', error);
    }
  };

  const modifiedOnClose = () => {
    setFormData({
      name: '',
      contact_info: ''
    });
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={modifiedOnClose} title="Add Supplier" onSubmit={handleAdd} submitButtonText="Add">
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
    </Modal>
  );
};

export default AddSupplierModal;
