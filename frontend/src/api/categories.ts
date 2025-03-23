import { apiClient } from './client';

export interface Category {
  category_id: number;
  name: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name: string;
}

export interface PartialUpdateCategoryPayload {
  name?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  return apiClient<Category[]>('/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function getCategoryById(categoryId: number): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function createCategory(authToken: string, categoryData: CreateCategoryPayload): Promise<Category> {
  return apiClient<Category>('/categories', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
}

export async function updateCategory(authToken: string, categoryId: number, categoryData: UpdateCategoryPayload): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
}

export async function partialUpdateCategory(authToken: string, categoryId: number, categoryData: PartialUpdateCategoryPayload): Promise<Category> {
  return apiClient<Category>(`/categories/${categoryId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categoryData),
  });
}

export async function deleteCategory(authToken: string, categoryId: number): Promise<void> {
  await apiClient<void>(`/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
