import { apiGet, apiPatch, apiPost } from './client.js';

export function listUsers() {
  return apiGet('/api/users');
}

export function createUser(payload) {
  return apiPost('/api/users', payload);
}

export function updateUser(id, payload) {
  return apiPatch(`/api/users/${id}`, payload);
}
