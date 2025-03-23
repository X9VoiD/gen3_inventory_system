import React, { useState, useEffect } from 'react';
import { updateUser, User, UpdateUserPayload } from '../api/users';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import Select from 'react-select';
import Modal from './ui/modal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  refetch: () => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, refetch }) => {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    username: user.username,
    password: '', // New password field
    role: user.role,
    is_active: user.is_active,
  });

  useEffect(() => {
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [id]: newValue,
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

  const handleUpdate = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot update user.");
      }
      const updatedUser = await updateUser(authToken, user.user_id, formData);
      addNotification(`User "${updatedUser.username}" updated successfully!`, 'success');
      onClose();
      await refetch();
    } catch (error: any) {
      console.error("Failed to update user:", error);
      addNotification(`Failed to update user: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const modifiedOnClose = () => {
    setFormData({
      username: user.username,
      password: '',
      role: user.role,
      is_active: user.is_active
    });
    onClose();
  };


  const roleOptions = [
    { value: 'Administrator', label: 'Administrator' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Staff', label: 'Staff' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={modifiedOnClose} title="Edit User" onSubmit={handleUpdate} submitButtonText="Update">
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
              New Password:
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
              value={roleOptions.find(option => option.value === formData.role)}
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
          <div className="mb-4">
            <label htmlFor="is_active" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Active:
            </label>
            <input
              type="checkbox"
              id="is_active"
              className="mr-2 leading-tight"
              checked={formData.is_active === 1}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditUserModal;
