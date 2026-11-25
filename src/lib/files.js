export const MAX_ORIGINAL_BYTES = 5 * 1024 * 1024;
export const MAX_CONTAINER_BYTES = 12 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
export const ACCEPT_ARCHIVE = ALLOWED_EXTENSIONS.join(',');

export function extensionOf(fileName) {
  const value = String(fileName ?? '').toLowerCase();
  const index = value.lastIndexOf('.');
  return index === -1 ? '' : value.slice(index);
}

export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function validateArchiveFile(file) {
  if (!file) return 'Berkas wajib dipilih';
  if (!ALLOWED_EXTENSIONS.includes(extensionOf(file.name))) {
    return 'Jenis berkas tidak didukung. Gunakan PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX.';
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    return 'Ukuran berkas melebihi 5 MB';
  }
  return '';
}

export function validateEncryptedFile(file) {
  if (!file) return 'Berkas wajib dipilih';
  if (extensionOf(file.name) !== '.enc') {
    return 'Berkas harus berformat .enc';
  }
  if (file.size > MAX_CONTAINER_BYTES) {
    return 'Ukuran berkas .enc melebihi batas';
  }
  return '';
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
