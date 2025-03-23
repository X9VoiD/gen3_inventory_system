import React, { useState, useEffect } from 'react';
import { getAllSuppliers, Supplier } from '../api/suppliers';
import { useAuth } from '../providers/auth-provider';
import { Pencil } from 'lucide-react';
import AddSupplierModal from '../components/add-supplier-modal';
import EditSupplierModal from '../components/edit-supplier-modal';
import { useNotification } from '../providers/notification-provider';

const SupplierManagementPage: React.FC = () => {
  const { authToken } = useAuth();
  const { addNotification } = useNotification();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    if (authToken) {
      try {
        const data = await getAllSuppliers(authToken);
        setSuppliers(data);
      } catch (error) {
        if (error instanceof Error) {
          addNotification(`Failed to fetch suppliers: ${error.message}`, 'error');
        } else {
          addNotification('Failed to fetch suppliers', 'error');
        }
        console.log('Error fetching suppliers:', error)
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [authToken]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingSupplier(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-ashley-background min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-ashley-gray-12">Supplier Management</h1>
          <button
            className="bg-ashley-gray-9 hover:bg-ashley-gray-10 text-ashley-accent-1 font-bold py-2 px-4 rounded"
            onClick={openAddModal}
          >
            Add Supplier
          </button>
        </div>

        {loading ? (
          <p className="text-ashley-gray-11">Loading suppliers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ashley-gray-6 border border-ashley-gray-6">
              <thead className="bg-ashley-gray-1">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-ashley-gray-6">
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="hover:bg-ashley-gray-1">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{supplier.supplier_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{supplier.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{supplier.contact_info || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(supplier)} className="text-ashley-gray-9 hover:text-ashley-gray-10 text-xs px-2 py-1 flex items-center">
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddSupplierModal isOpen={isAddModalOpen} onClose={closeAddModal} refetch={fetchSuppliers} />
      {editingSupplier && (
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          supplier={editingSupplier}
          refetch={fetchSuppliers}
        />
      )}
    </div>
  );
};

export default SupplierManagementPage;
