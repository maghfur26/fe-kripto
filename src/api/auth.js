import { apiGet, apiPost } from './client.js';

export function login(username, password) {
  return apiPost('/api/auth/login', { username, password }, { skipUnauthorized: true });
}

export function logout() {
  return apiPost('/api/auth/logout', {});
}

export function me() {
  return apiGet('/api/auth/me', { skipUnauthorized: true });
}
