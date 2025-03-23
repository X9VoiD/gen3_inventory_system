import { API_BASE_URL } from '../config';

interface User {
  user_id: number;
  username: string;
  role: string;
  is_active: number;
}

interface UserFilterParams {
  username?: string;
  role?: string;
  is_active?: number;
}

interface CreateUserPayload {
  username: string;
  password: string;
  role: string;
}

interface UpdateUserPayload extends CreateUserPayload {
  is_active: number;
}

interface PartialUpdateUserPayload {
  username?: string;
  password?: string;
  role?: string;
  is_active?: number;
}

function buildQueryString(filters?: UserFilterParams): string {
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

export async function getAllUsers(authToken: string, filters?: UserFilterParams): Promise<User[]> {
  const queryString = buildQueryString(filters);

  try {
    const response = await fetch(`${API_BASE_URL}/users${queryString}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch users (${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json() as User[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function getUserById(authToken: string, userId: number): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch user (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'User not found';
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

    return await response.json() as User;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function createUser(authToken: string, userData: CreateUserPayload): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create user (${response.status})`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      if (response.status === 403) {
        errorMessage = 'Forbidden: Insufficient permissions';
      }
    }

    return await response.json() as User;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function updateUser(authToken: string, userId: number, userData: UpdateUserPayload): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update user (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'User not found';
      } else if (response.status === 400) {
        errorMessage = 'Missing required fields for PUT or invalid role';
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

    return await response.json() as User;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function partialUpdateUser(authToken: string, userId: number, userData: PartialUpdateUserPayload): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to partially update user (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'User not found';
      } else if (response.status === 400) {
        errorMessage = 'No valid fields to update';
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

    return await response.json() as User;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error('Unknown network error');
  }
}

export async function deactivateUser(authToken: string, userId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to deactivate user (${response.status})`;

      if (response.status === 404) {
        errorMessage = 'User not found';
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
