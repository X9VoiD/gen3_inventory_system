import { API_BASE_URL } from '../config';

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

  try {
    const response = await fetch(`${API_BASE_URL}/products${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch products (${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json() as Product[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function getProductById(authToken: string, productId: number): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch product (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Product not found';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Product;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function createProduct(authToken: string, productData: CreateProductPayload): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create product (${response.status})`;

      if (response.status === 400) {
        errorMessage = 'Invalid product data';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Product;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function updateProduct(authToken: string, productId: number, productData: UpdateProductPayload): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update product (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Product not found';
      } else if (response.status === 400) {
        errorMessage = 'Invalid product data';
      }
      else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Product;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function partialUpdateProduct(authToken: string, productId: number, productData: PartialUpdateProductPayload): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to partially update product (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Product not found';
      } else if (response.status === 400) {
        errorMessage = 'No valid fields to update';
      }
      else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

    return await response.json() as Product;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function deactivateProduct(authToken: string, productId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to deactivate product (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Product not found';
      } else {
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
      throw new Error(errorMessage);
    }

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}
