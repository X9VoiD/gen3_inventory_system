import React, { useState, useEffect } from 'react';
import { updateSupplier, Supplier, UpdateSupplierPayload, deleteSupplier } from '../api/suppliers';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import useErrorNotifier from '../hooks/useErrorNotifier';
import Modal from './ui/modal';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  refetch: () => Promise<void>;
}

const EditSupplierModal: React.FC<EditSupplierModalProps> = ({ isOpen, onClose, supplier, refetch }) => {
  const [formData, setFormData] = useState<UpdateSupplierPayload>({
    name: supplier.name,
    contact_info: supplier.contact_info || '',
  });

  useEffect(() => {
    setFormData({
      name: supplier.name,
      contact_info: supplier.contact_info || '',
    });
  }, [supplier]);

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

  const handleUpdate = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot update supplier.");
      }
      const updatedSupplier = await updateSupplier(authToken, supplier.supplier_id, formData);
      addNotification(`Supplier "${updatedSupplier.name}" updated successfully!`, 'success');
      onClose();
      await refetch();
    } catch (error: any) {
      reportError('update supplier', error);
    }
  };

  const handleDelete = async () => {
    if (!authToken) {
      throw new Error("User not authenticated. Cannot delete supplier.");
    }
    try {
      await deleteSupplier(authToken, supplier.supplier_id);
      addNotification('Supplier deleted successfully!', 'success');
      onClose();
      await refetch();
    } catch (error) {
      reportError('delete supplier', error);
    }
  };

  const modifiedOnClose = () => {
    setFormData({
      name: supplier.name,
      contact_info: supplier.contact_info || ''
    });
    onClose();
  }


  return (
    <Modal
      isOpen={isOpen}
      onClose={modifiedOnClose}
      title="Edit Supplier"
      onSubmit={handleUpdate}
      submitButtonText="Update"
      onDelete={handleDelete}
      deleteButtonText="Delete Supplier"
    >
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

export default EditSupplierModal;
