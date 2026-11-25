import { apiGet } from './client.js';

export function getDashboard() {
  return apiGet('/api/dashboard');
}
