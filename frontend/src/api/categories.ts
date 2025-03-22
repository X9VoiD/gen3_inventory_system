import { API_BASE_URL } from '../config';
import { useAuth } from '../providers/auth-provider';

interface Category {
  category_id: number;
  name: string;
}

interface CreateCategoryPayload {
  name: string;
}

interface UpdateCategoryPayload {
  name: string;
}

interface PartialUpdateCategoryPayload {
  name?: string;
}

export async function getAllCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch categories (${response.status})`;

      if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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

    return await response.json() as Category[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function getCategoryById(categoryId: number): Promise<Category> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch category (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Category not found';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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

    return await response.json() as Category;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function createCategory(categoryData: CreateCategoryPayload): Promise<Category> {
  const { authToken } = useAuth();

  try {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create category (${response.status})`;

      if (response.status === 400) {
        errorMessage = 'Missing required fields';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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

    return await response.json() as Category;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function updateCategory(categoryId: number, categoryData: UpdateCategoryPayload): Promise<Category> {
  const { authToken } = useAuth();

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update category (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Category not found';
      } else if (response.status === 400) {
        errorMessage = 'Missing required fields';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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

    return await response.json() as Category;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function partialUpdateCategory(categoryId: number, categoryData: PartialUpdateCategoryPayload): Promise<Category> {
  const { authToken } = useAuth();

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to partially update category (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Category not found';
      } else if (response.status === 400) {
        errorMessage = 'No valid fields to update';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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

    return await response.json() as Category;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function deleteCategory(categoryId: number): Promise<void> {
  const { authToken } = useAuth();

  try {
    const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete category (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'Category not found';
      } else if (response.status === 409) {
        errorMessage = 'Cannot delete category with associated products';
      } else if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
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
