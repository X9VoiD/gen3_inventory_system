import { apiClient } from './client';

export interface Product {
  product_id: number;
  item_code: string;
  name: string;
  description: string | null;
  supplier_id: number;
  category_id: number;
  unit_cost: number;
  selling_price: number;
  is_vat_exempt: boolean;
  stock_on_hand: number;
  is_active: boolean;
}

export interface ProductFilterParams {
  category_id?: number;
  supplier_id?: number;
  item_code?: string;
  name?: string;
  is_active?: number;
  stock_on_hand_lte?: number;
  stock_on_hand_gte?: number;
}

export interface CreateProductPayload {
  item_code: string;
  name: string;
  description?: string;
  supplier_id: number;
  category_id: number;
  unit_cost: number;
  selling_price: number;
  is_vat_exempt: boolean;
}

export interface UpdateProductPayload extends CreateProductPayload {
  is_active: number;
  stock_on_hand: number;
}

export interface PartialUpdateProductPayload {
  name?: string;
  description?: string;
  supplier_id?: number;
  category_id?: number;
  unit_cost?: number;
  selling_price?: number;
  is_vat_exempt?: number;
  is_active?: number;
}

function buildQueryString(filters?: ProductFilterParams): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      value.forEach(v => params.append(key, v));
    } else {
      params.append(key, String(value));
    }
  }

  return params.size > 0 ? `?${params}` : '';
}

export async function getAllProducts(authToken: string, filters?: ProductFilterParams): Promise<Product[]> {
  const queryString = buildQueryString(filters);

  return apiClient<Product[]>(`/products${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getProductById(authToken: string, productId: number): Promise<Product> {
  return apiClient<Product>(`/products/${productId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function createProduct(authToken: string, productData: CreateProductPayload): Promise<Product> {
  return apiClient<Product>('/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
}

export async function updateProduct(authToken: string, productId: number, productData: UpdateProductPayload): Promise<Product> {
  return apiClient<Product>(`/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
}

export async function partialUpdateProduct(authToken: string, productId: number, productData: PartialUpdateProductPayload): Promise<Product> {
  return apiClient<Product>(`/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(productData),
  });
}

export async function deactivateProduct(authToken: string, productId: number): Promise<void> {
  return apiClient<void>(`/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
