import { API_BASE_URL } from '../config';
import { ApiError, NetworkError } from './errors';

async function handleResponse<T>(response: Response, errorMapping?: Record<number, string>): Promise<T> {
  if (!response.ok) {
    if (errorMapping && errorMapping[response.status]) {
      throw new ApiError(errorMapping[response.status], response.status);
    }

    let errorMessage = 'Request failed'; // Default error message
    switch (response.status) {
      case 400:
        errorMessage = 'Bad Request: Invalid data sent to the server.';
        break;
      case 401:
        errorMessage = 'Unauthorized: Authentication required.';
        break;
      case 403:
        errorMessage = 'Forbidden: Insufficient permissions.';
        break;
      case 404:
        errorMessage = 'Not Found: Resource not found.';
        break;
      case 500:
        errorMessage = 'Internal Server Error: Server-side error occurred.';
        break;
      default:
        errorMessage = `Request failed (${response.status}): An unexpected error occurred.`;
    }

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage; // Prefer message from backend if available
    } catch (error) {
      errorMessage = await response.text() || errorMessage; // Fallback to text error if JSON parsing fails
    }
    throw new ApiError(errorMessage, response.status);
  }
  return await response.json() as T;
}

async function apiClient<T>(endpoint: string, config: RequestInit = {}, errorMapping?: Record<number, string>): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);
    return handleResponse<T>(response, errorMapping);
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') {
      throw error;
    }
    throw new NetworkError('Network error occurred');
  }
}

export { apiClient };
