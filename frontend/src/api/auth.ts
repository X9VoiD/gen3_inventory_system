import { API_BASE_URL } from '../config';

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed'); // TODO: more specific error handling
  }

  const data = await response.json();
  return data.token;
}
