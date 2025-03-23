import React, { useState, useEffect } from 'react';
import { getAllTransactions, Transaction } from '../api/transactions';
import { getAllSuppliers, Supplier } from '../api/suppliers';
import { getAllUsers, User } from '../api/users';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import AddTransactionModal from '../components/add-transaction-modal';

const TransactionPage: React.FC = () => {
  const { authToken } = useAuth();
  const { addNotification } = useNotification();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [suppliersMap, setSuppliersMap] = useState<Map<number, Supplier>>(new Map());
  const [usersMap, setUsersMap] = useState<Map<number, User>>(new Map());

  const fetchTransactions = async () => {
    if (authToken) {
      try {
        const transactionsData = await getAllTransactions(authToken);
        setTransactions(transactionsData);

        const suppliersData = await getAllSuppliers(authToken);
        const suppliersMapData = new Map<number, Supplier>();
        suppliersData.forEach(supplier => suppliersMapData.set(supplier.supplier_id, supplier));
        setSuppliersMap(suppliersMapData);

        const usersData = await getAllUsers(authToken);
        const usersMapData = new Map<number, User>();
        usersData.forEach(user => usersMapData.set(user.user_id, user));
        setUsersMap(usersMapData);
      } catch (error) {
        if (error instanceof Error) {
          addNotification(`Failed to fetch transactions: ${error.message}`, 'error');
        } else {
          addNotification('Failed to fetch transactions', 'error');
        }
        console.error('Error fetching transactions:', error)
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [authToken]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="bg-ashley-background min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-ashley-gray-12">Transaction Management</h1>
          <button
            className="bg-ashley-gray-9 hover:bg-ashley-gray-10 text-ashley-accent-1 font-bold py-2 px-4 rounded"
            onClick={openAddModal}
          >
            Add Transaction
          </button>
        </div>

        {loading ? (
          <p className="text-ashley-gray-11">Loading transactions...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ashley-gray-6 border border-ashley-gray-6">
              <thead className="bg-ashley-gray-1">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Product ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Supplier ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">User ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-ashley-gray-6">
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id} className="hover:bg-ashley-gray-1">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{transaction.transaction_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{transaction.product_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{transaction.transaction_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{transaction.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{transaction.transaction_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">
                      {transaction.supplier_id ? suppliersMap.get(transaction.supplier_id)?.name || '-' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">
                      {usersMap.get(transaction.user_id)?.username || 'Unknown User'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{transaction.price || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddTransactionModal isOpen={isAddModalOpen} onClose={closeAddModal} refetch={fetchTransactions} />
    </div>
  );
};

export default TransactionPage;
