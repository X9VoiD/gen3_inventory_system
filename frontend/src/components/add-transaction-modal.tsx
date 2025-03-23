import React, { useState, useEffect } from 'react';
import { createTransaction, CreateTransactionPayload } from '../api/transactions';
import { useAuth } from '../providers/auth-provider';
import useErrorNotifier from '../hooks/useErrorNotifier';
import { useNotification } from '../providers/notification-provider';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from './ui/modal';
import { getAllProducts } from '../api/products';
import { getAllSuppliers } from '../api/suppliers';
import { getAllUsers } from '../api/users';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => Promise<void>;
}

interface ProductOption {
  value: number;
  label: string;
}

interface SupplierOption {
  value: number;
  label: string;
}

interface UserOption {
  value: number;
  label: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, refetch }) => {
  const { authToken } = useAuth();
  const { addNotification } = useNotification();
  const { reportError } = useErrorNotifier();

  const [formData, setFormData] = useState<CreateTransactionPayload>({
    product_id: 0,
    transaction_type: 'Delivery',
    quantity: 0,
    transaction_date: new Date().toISOString(),
    user_id: 0,
  });

  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<SupplierOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (authToken) {
        const productsData = await getAllProducts(authToken);
        const suppliersData = await getAllSuppliers(authToken);
        const usersData = await getAllUsers(authToken);

        setProductOptions(productsData.map(product => ({ value: product.product_id, label: product.name })));
        setSupplierOptions(suppliersData.map(supplier => ({ value: supplier.supplier_id, label: supplier.name })));
        setUserOptions(usersData.map(user => ({ value: user.user_id, label: user.username })));
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, authToken]);

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

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setTransactionDate(date);
      setFormData(prev => ({
        ...prev,
        transaction_date: date.toISOString()
      }));
    }
  };

  const handleAdd = async () => {
    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot create transaction.");
      }
      await createTransaction(authToken, formData);
      addNotification('Transaction created successfully!', 'success');
      onClose();
      await refetch();
    } catch (error) {
      reportError('create transaction', error);
    }
  };

  const modifiedOnClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const transactionTypeOptions = [
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Pull-out', label: 'Pull-out' },
    { value: 'Sale', label: 'Sale' },
    { value: 'Return', label: 'Return' },
  ];


  return (
    <Modal isOpen={isOpen} onClose={modifiedOnClose} title="Add Transaction" onSubmit={handleAdd} submitButtonText="Add">
      <div className="mt-2">
        <form>
          <div className="mb-4">
            <label htmlFor="product_id" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Product:
            </label>
            <Select
              id="product_id"
              options={productOptions}
              onChange={(selectedOption) => handleSelectChange('product_id', selectedOption)}
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
            <label htmlFor="transaction_type" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Transaction Type:
            </label>
            <Select
              id="transaction_type"
              options={transactionTypeOptions}
              onChange={(selectedOption) => handleSelectChange('transaction_type', selectedOption)}
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
            <label htmlFor="quantity" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Quantity:
            </label>
            <input
              type="number"
              id="quantity"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="transaction_date" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Transaction Date:
            </label>
            <DatePicker
              selected={transactionDate}
              onChange={handleDateChange}
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
            />
          </div>
          {formData.transaction_type === 'Delivery' || formData.transaction_type === 'Pull-out' ? (
            <div className="mb-4">
              <label htmlFor="supplier_id" className="block text-ashley-gray-12 text-sm font-bold mb-2">
                Supplier:
              </label>
              <Select
                id="supplier_id"
                options={supplierOptions}
                onChange={(selectedOption) => handleSelectChange('supplier_id', selectedOption)}
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
          ) : null}
          <div className="mb-4">
            <label htmlFor="user_id" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              User:
            </label>
            <Select
              id="user_id"
              options={userOptions}
              onChange={(selectedOption) => handleSelectChange('user_id', selectedOption)}
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
          {formData.transaction_type === 'Sale' || formData.transaction_type === 'Return' ? (
            <div className="mb-4">
              <label htmlFor="price" className="block text-ashley-gray-12 text-sm font-bold mb-2">
                Price:
              </label>
              <input
                type="number"
                id="price"
                className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
                value={formData.price as number} // Type assertion
                onChange={handleChange}
              />
            </div>
          ) : null}
        </form>
      </div>
    </Modal>
  );
};

export default AddTransactionModal;
