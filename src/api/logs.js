import { apiGet } from './client.js';

export function listLogs(params = {}) {
  const search = new URLSearchParams();
  if (params.tanggal) search.set('tanggal', params.tanggal);
  if (params.userId) search.set('userId', String(params.userId));
  const query = search.toString();
  return apiGet(`/api/logs${query ? `?${query}` : ''}`);
}
