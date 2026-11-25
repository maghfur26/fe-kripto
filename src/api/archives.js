import { apiDelete, apiDownload, apiGet, apiUpload } from './client.js';

export function listArchives({ q = '', tanggal = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (tanggal) params.set('tanggal', tanggal);
  const query = params.toString();
  return apiGet(`/api/archives${query ? `?${query}` : ''}`);
}

export async function uploadArchive({ file, password, passwordConfirm }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);
  formData.append('passwordConfirm', passwordConfirm);
  const response = await apiUpload('/api/archives', formData);
  return response.json();
}

export function downloadArchive(id, password, fallbackName = 'arsip') {
  return apiDownload(`/api/archives/${id}/download`, { password }, fallbackName);
}

export function deleteArchive(id) {
  return apiDelete(`/api/archives/${id}`);
}
