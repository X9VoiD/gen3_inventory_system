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
    let errorMessage = 'Login failed';
    try {
      // Attempt to parse error response (even for non-200 responses)
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (error) {
      // Handle non-JSON error response
      errorMessage = await response.text() || errorMessage;
    }

    // Map specific status codes to messages
    switch (response.status) {
      case 401:
        throw new Error('Invalid credentials');
      case 404:
        throw new Error('User not found'); // Not for user not found
      default:
        throw new Error(errorMessage);
    }
  }

  const data = await response.json();
  return data.token;
}
