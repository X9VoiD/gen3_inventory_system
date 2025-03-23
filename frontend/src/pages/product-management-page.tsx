import React, { useState, useEffect } from 'react';
import { getAllProducts, Product } from '../api/products';
import { getAllSuppliers, Supplier } from '../api/suppliers';
import { getAllCategories, Category } from '../api/categories';
import { useAuth } from '../providers/auth-provider';
import { Pencil, Package } from 'lucide-react';
import AddProductModal from '../components/add-product-modal';
import EditProductModal from '../components/edit-product-modal';
import useErrorNotifier from '../hooks/useErrorNotifier';

const ProductManagementPage: React.FC = () => {
  const { authToken } = useAuth();
  const { reportError } = useErrorNotifier();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [suppliersMap, setSuppliersMap] = useState<Map<number, Supplier>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesMap, setCategoriesMap] = useState<Map<number, Category>>(new Map());

  const fetchProducts = async () => {
    if (authToken) {
      try {
        const data = await getAllProducts(authToken);
        setProducts(data);
      } catch (error) {
        reportError('fetch products', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchProducts();
      const fetchData = async () => {
        try {
          const suppliersData = await getAllSuppliers(authToken);
          const categoriesData = await getAllCategories();
          setSuppliers(suppliersData);
          const suppliersMapData = new Map<number, Supplier>();
          suppliersData.forEach(supplier => suppliersMapData.set(supplier.supplier_id, supplier));
          setSuppliersMap(suppliersMapData);
          setCategories(categoriesData);
          const categoriesMapData = new Map<number, Category>();
          categoriesData.forEach(category => categoriesMapData.set(category.category_id, category));
          setCategoriesMap(categoriesMapData);
        } catch (error) {
          console.error('Failed to fetch suppliers or categories:', error);
        }
      };
      fetchData();
    }
  }, [authToken]);

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setIsEditModalOpen(false);
  };

  return (
    <div className="bg-ashley-background min-h-screen">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-ashley-gray-12">Product Management</h1>
          <button
            className="bg-ashley-gray-9 hover:bg-ashley-gray-10 text-ashley-accent-1 font-bold py-2 px-4 rounded"
            onClick={openAddModal}
          >
            Add Product
          </button>
        </div>

        {loading ? (
          <p className="text-ashley-gray-11">Loading products...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ashley-gray-6 border border-ashley-gray-6">
              <thead className="bg-ashley-gray-1">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Item Code</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Supplier</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Unit Cost</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Selling Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">VAT Exempt</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Active</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ashley-gray-11 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-ashley-gray-6">
                {products.map((product) => (
                  <tr key={product.product_id} className="hover:bg-ashley-gray-1">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{product.item_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-12">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{product.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">
                      {suppliersMap.get(product.supplier_id)?.name || 'Unknown Supplier'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">
                      {categoriesMap.get(product.category_id)?.name || 'Unknown Category'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{product.unit_cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{product.selling_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{product.is_vat_exempt ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        <div className="px-3 py-1 rounded-full bg-ashley-accent-2 text-ashley-gray-12 text-xs font-medium">
                          {product.stock_on_hand}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ashley-gray-11">{product.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(product)} className="text-ashley-gray-9 hover:text-ashley-gray-10 text-xs px-2 py-1 flex items-center">
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
      <AddProductModal isOpen={isAddModalOpen} onClose={closeAddModal} suppliers={suppliers} categories={categories} refetch={fetchProducts} />
      {editingProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          suppliers={suppliers}
          categories={categories}
          product={editingProduct}
          refetch={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductManagementPage;
