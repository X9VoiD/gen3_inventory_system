import React, { useState } from 'react';
import { Supplier } from '../api/suppliers';
import { Category } from '../api/categories';
import Select from 'react-select';
import { createProduct } from '../api/products';

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

  const handleAdd = async () => {
    try {
      await createProduct(formData);
      onClose();
      refetch();
    } catch (error) {
      console.error("Failed to create product:", error);
      // Handle error appropriately (e.g., show an error message to the user)
    }
  };

  if (!isOpen) return null;

  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.supplier_id,
    label: supplier.name
  }));

  const categoryOptions = categories.map(category => ({
    value: category.category_id,
    label: category.name
  }));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-ashley-gray-12 opacity-75"></div>
        </div>

        <div className="bg-ashley-background rounded-lg overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="bg-ashley-background px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-ashley-gray-12" id="modal-title">
                  Add Product
                </h3>
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
              </div>
            </div>
          </div>
          <div className="bg-ashley-gray-1 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-ashley-gray-9 text-base font-medium text-ashley-accent-1 hover:bg-ashley-gray-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-gray-8 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleAdd}
            >
              Add
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-ashley-gray-6 shadow-sm px-4 py-2 bg-ashley-background text-base font-medium text-ashley-gray-12 hover:bg-ashley-gray-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ashley-accent-8 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
