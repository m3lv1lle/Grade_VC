const BASE_URL = '/api';

export const api = async (endpoint: string, method = 'GET', body: any = null, token: string | null = null) => {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    const err = await res.json();
    throw new Error(err.message || 'API Error');
  }
  return res.json();
};