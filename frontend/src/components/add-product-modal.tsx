import React, { useState } from 'react';
import { Supplier } from '../api/suppliers';
import { Category } from '../api/categories';
import Select from 'react-select';
import { createProduct } from '../api/products';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import Modal from './ui/modal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  categories: Category[];
  refetch: () => Promise<void>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, suppliers, categories, refetch }) => {
  const [formData, setFormData] = useState({
    item_code: '',
    name: '',
    description: '',
    supplier_id: 0,
    category_id: 0,
    unit_cost: 0,
    selling_price: 0,
    is_vat_exempt: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleAdd = async () => {
    if (formData.selling_price < formData.unit_cost) {
      addNotification('Selling price cannot be less than unit cost.', 'error');
      return;
    }

    try {
      if (!authToken) {
        throw new Error("User not authenticated. Cannot create product.");
      }
      await createProduct(authToken, formData);
      addNotification('Product created successfully!', 'success');
      onClose();
      await refetch();
    } catch (error: any) {
      console.error("Failed to create product:", error);
      addNotification(`Failed to create product: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.supplier_id,
    label: supplier.name
  }));

  const categoryOptions = categories.map(category => ({
    value: category.category_id,
    label: category.name
  }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Product" onSubmit={handleAdd}>
      <div className="mt-2">
        <form>
          <div className="mb-4">
            <label htmlFor="item_code" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Item Code:
            </label>
            <input
              type="text"
              id="item_code"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.item_code}
              onChange={handleChange}
            />
          </div>
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
            <label htmlFor="description" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              id="description"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
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
          <div className="mb-4">
            <label htmlFor="category_id" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Category:
            </label>
            <Select
              id="category_id"
              options={categoryOptions}
              onChange={(selectedOption) => handleSelectChange('category_id', selectedOption)}
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
            <label htmlFor="unit_cost" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Unit Cost:
            </label>
            <input
              type="number"
              id="unit_cost"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.unit_cost}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="selling_price" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Selling Price:
            </label>
            <input
              type="number"
              id="selling_price"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.selling_price}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="is_vat_exempt" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              VAT Exempt:
            </label>
            <input
              type="checkbox"
              id="is_vat_exempt"
              className="mr-2 leading-tight"
              checked={formData.is_vat_exempt}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </Modal>
  )
};

export default AddProductModal;
