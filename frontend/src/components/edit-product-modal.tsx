import React, { useState, useEffect } from 'react';
import { Supplier } from '../api/suppliers';
import { Category } from '../api/categories';
import Select from 'react-select';
import { updateProduct, Product, UpdateProductPayload } from '../api/products';
import { useAuth } from '../providers/auth-provider';
import { useNotification } from '../providers/notification-provider';
import Modal from './ui/modal';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  categories: Category[];
  product: Product;
  refetch: () => Promise<void>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, suppliers, categories, product, refetch }) => {
  const [formData, setFormData] = useState<UpdateProductPayload>({
    item_code: product.item_code,
    name: product.name,
    description: product.description || '',
    supplier_id: product.supplier_id,
    category_id: product.category_id,
    unit_cost: product.unit_cost,
    selling_price: product.selling_price,
    is_vat_exempt: product.is_vat_exempt,
    is_active: product.is_active,
    stock_on_hand: product.stock_on_hand
  });

  useEffect(() => {
    setFormData({
      item_code: product.item_code,
      name: product.name,
      description: product.description || '',
      supplier_id: product.supplier_id,
      category_id: product.category_id,
      unit_cost: product.unit_cost,
      selling_price: product.selling_price,
      is_vat_exempt: product.is_vat_exempt,
      is_active: product.is_active,
      stock_on_hand: product.stock_on_hand
    });
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        throw new Error("User not authenticated. Cannot update product.");
      }
      await updateProduct(authToken, product.product_id, formData);
      addNotification('Product updated successfully!', 'success');
      onClose();
      await refetch();
    } catch (error: any) {
      console.error("Failed to update product:", error);
      addNotification(`Failed to update product: ${error.message || 'Unknown error'}`, 'error');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Product" onSubmit={handleUpdate} submitButtonText="Update">
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
              value={supplierOptions.find(option => option.value === formData.supplier_id)}
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
              value={categoryOptions.find(option => option.value === formData.category_id)}
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

          <div className="mb-4">
            <label htmlFor="stock_on_hand" className="block text-ashley-gray-12 text-sm font-bold mb-2">
              Stock on Hand:
            </label>
            <input
              type="number"
              id="stock_on_hand"
              className="text-ashley-gray-12 placeholder-ashley-gray-11 bg-ashley-background border-2 border-ashley-gray-6 rounded-md focus:outline-none focus:ring-2 focus:ring-ashley-accent-8 focus:border-ashley-accent-8 w-full py-2 px-3"
              value={formData.stock_on_hand}
              onChange={handleChange}
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
              checked={formData.is_active}
              onChange={handleChange}
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditProductModal;
