import React, { useState, useEffect } from 'react';
import { getAllUsers, User, deactivateUser } from '../api/users';
import { useAuth } from '../providers/auth-provider';
import { Pencil, XCircle } from 'lucide-react';
import AddUserModal from '../components/add-user-modal';
import EditUserModal from '../components/edit-user-modal';
import { useNotification } from '../providers/notification-provider';

const UsersPage: React.FC = () => {
  const { authToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { addNotification } = useNotification();

  const fetchUsers = async () => {
    if (authToken) {
      try {
        const data = await getAllUsers(authToken);
        setUsers(data);
      } catch (error) {
        if (error instanceof Error) {
          addNotification(`Failed to fetch users: ${error.message}`, 'error');
        } else {
          addNotification('Failed to fetch users', 'error');
        }
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [authToken]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);
  };

  const handleDeactivate = async (user: User) => {
    if (confirm(`Are you sure you want to deactivate user ${user.username}?`)) {
      try {
        if (!authToken) {
          throw new Error("User not authenticated. Cannot deactivate user.");
        }
        await deactivateUser(authToken, user.user_id);
        addNotification(`User "${user.username}" deactivated successfully!`, 'success');
        await fetchUsers();
      } catch (error: any) {
        console.error("Failed to deactivate user:", error);
        addNotification(`Failed to deactivate user: ${error.message || 'Unknown error'}`, 'error');
      }
    }
  };

  return (
    <div className="bg-ashley-background min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-ashley-gray-12">User Management</h1>
          <button
            className="bg-ashley-gray-9 hover:bg-ashley-gray-10 text-ashley-accent-1 font-bold py-2 px-4 rounded"
            onClick={openAddModal}
          >
            Add User
          </button>
        </div>

        {loading ? (
          <p className="text-ashley-gray-11">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ashley-gray-6 border border-ashley-gray-6">
              <thead className="bg-ashley-gray-1">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Username</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-ashley-gray-6">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-ashley-gray-1">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{user.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{user.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(user)} className="text-ashley-gray-9 hover:text-ashley-gray-10 text-xs px-2 py-1 flex items-center mr-2">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </button>
                      <button onClick={() => handleDeactivate(user)} className="text-ashley-gray-9 hover:text-ashley-gray-10 text-xs px-2 py-1 flex items-center">
                        <XCircle className="h-4 w-4 mr-1" /> Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddUserModal isOpen={isAddModalOpen} onClose={closeAddModal} refetch={fetchUsers} />
      {editingUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          user={editingUser}
          refetch={fetchUsers}
        />
      )}
    </div>
  );
};

export default UsersPage;
