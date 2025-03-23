import { apiClient } from './client';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const errorMapping = {
    401: 'Invalid credentials',
    404: 'User not found'
  };

  const data = await apiClient<LoginResponse>('/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  }, errorMapping);
  return data;
}

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

export async function refreshToken(refreshToken: string, accessToken: string): Promise<RefreshResponse> {
    const errorMapping = {
        401: 'Invalid refresh token',
    };

    const data = await apiClient<RefreshResponse>('/users/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    }, errorMapping);
    return data;
}
