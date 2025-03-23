import { apiClient } from './client';

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

  return apiClient<User[]>(`/users${queryString}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function getUserById(authToken: string, userId: number): Promise<User> {
  return apiClient<User>(`/users/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}

export async function createUser(authToken: string, userData: CreateUserPayload): Promise<User> {
  return apiClient<User>('/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
}

export async function updateUser(authToken: string, userId: number, userData: UpdateUserPayload): Promise<User> {
  return apiClient<User>(`/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
}

export async function partialUpdateUser(authToken: string, userId: number, userData: PartialUpdateUserPayload): Promise<User> {
  return apiClient<User>(`/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
}

export async function deactivateUser(authToken: string, userId: number): Promise<void> {
  return apiClient<void>(`/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });
}
