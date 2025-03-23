import React, { useState } from 'react';
import { createUser, CreateUserPayload } from '../api/users';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import useErrorNotifier from '../hooks/useErrorNotifier';
import Select from 'react-select';
import Modal from './ui/modal';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, refetch }) => {
  const [formData, setFormData] = useState<CreateUserPayload>({
    username: '',
    password: '',
    role: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (id: string, selectedOption: any) => {
    setFormData(prev => ({
      ...prev,
      [id]: selectedOption.value
    }));
  };

  const { authToken } = useAuth();
  const { addNotification } = useNotification();
  const { reportError } = useErrorNotifier();

  const handleAdd = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot create user.");
      }
      const newUser = await createUser(authToken, formData);
      addNotification(`User "${newUser.username}" created successfully!`, 'success');
      onClose();
      await refetch();
    } catch (error) {
      reportError('create user', error);
    }
  };

  const modifiedOnClose = () => {
    setFormData({
      username: '',
      password: '',
      role: '',
    });
    onClose();
  };


  const roleOptions = [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Staff', label: 'Staff' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={modifiedOnClose} title="Add User" onSubmit={handleAdd} submitButtonText="Add">
      <div className="mt-2">
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="role" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Role:
            </label>
            <Select
              id="role"
              options={roleOptions}
              onChange={(selectedOption) => handleSelectChange('role', selectedOption)}
              className="text-ashley-gray-12"
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: 'var(--color-ashley-accent-3)',
                  primary: 'var(--color-ashley-gray-9)',
                  neutral0: 'var(--color-ashley-background)',
                  neutral80: 'var(--color-ashley-gray-12)',
                },
              })}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddUserModal;
