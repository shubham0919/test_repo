interface ApiClientOptions extends RequestInit {
  token?: string | null;
  isFormData?: boolean;
}

async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { token, body, headers: customHeaders, isFormData, ...restOptions } = options;
  const defaultHeaders: HeadersInit = {};

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && body) {
      defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const response = await fetch(`/api${endpoint}`, {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...customHeaders,
    },
    body: isFormData ? (body as FormData) : (body ? JSON.stringify(body) : undefined),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) { // No Content
    return null as T;
  }
  
  return response.json() as Promise<T>;
}

export default apiClient;

// Example Usage:
// apiClient<{ id: string, name: string }>('/users/1', { token: 'jwtToken' })
//   .then(user => console.log(user))
//   .catch(error => console.error(error));

// apiClient('/items', { method: 'POST', body: { name: 'New Item' }, token: 'jwtToken' })
//   .then(newItem => console.log(newItem))
//   .catch(error => console.error(error));
