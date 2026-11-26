import { useAuthStore } from './store';

const API_BASE = '/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = '/admin';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'API Request Failed');
  }

  return response.json();
}

export const api = {
  shorten: (data: { url: string; custom_code?: string; domain_id?: string; expires_at?: string; use_tcn?: boolean; password?: string }) => 
    fetchWithAuth('/shorten', { method: 'POST', body: JSON.stringify(data) }),
  
  adminLogin: (data: any) => 
    fetchWithAuth('/admin/login', { method: 'POST', body: JSON.stringify(data) }),
    
  getPublicDomains: () => fetchWithAuth('/domains'),
  getStats: () => fetchWithAuth('/admin/stats'),
  getLinkStats: (id: string) => fetchWithAuth(`/admin/links/${id}/stats`),
  getLinks: () => fetchWithAuth('/admin/links'),
  updateLink: (id: string, data: { expires_at?: string | null; password?: string | null }) =>
    fetchWithAuth(`/admin/links/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLink: (id: string) =>
    fetchWithAuth(`/admin/links/${id}`, { method: 'DELETE' }),
  getDomains: () => fetchWithAuth('/admin/domains'),
  createDomain: (data: { domain: string; is_primary?: boolean }) => 
    fetchWithAuth('/admin/domains', { method: 'POST', body: JSON.stringify(data) }),
  deleteDomain: (id: string) => 
    fetchWithAuth(`/admin/domains/${id}`, { method: 'DELETE' }),
  getAccount: () => fetchWithAuth('/admin/account'),
  updateAccount: (data: { current_password: string; new_username?: string; new_password?: string }) =>
    fetchWithAuth('/admin/account', { method: 'POST', body: JSON.stringify(data) }),
};
