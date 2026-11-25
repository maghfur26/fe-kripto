let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
}

async function readPayload(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return null;
}

async function readError(response) {
  const payload = await readPayload(response);
  const error = new Error(payload?.message ?? `Permintaan gagal (HTTP ${response.status})`);
  error.status = response.status;
  error.payload = payload;
  return error;
}

export async function apiFetch(path, options = {}) {
  const { skipUnauthorized = false, ...fetchOptions } = options;
  const headers = {
    ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers ?? {}),
  };
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...fetchOptions,
    headers,
  });

  const payload = await readPayload(response);

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorized && path !== '/api/auth/login' && unauthorizedHandler) {
      unauthorizedHandler({ path, status: 401 });
    }
    const error = new Error(payload?.message ?? `Permintaan gagal (HTTP ${response.status})`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export function apiGet(path, options = {}) {
  return apiFetch(path, { ...options, method: 'GET' });
}

export function apiPost(path, body, options = {}) {
  return apiFetch(path, { ...options, method: 'POST', body: JSON.stringify(body) });
}

export function apiPatch(path, body, options = {}) {
  return apiFetch(path, { ...options, method: 'PATCH', body: JSON.stringify(body) });
}

export function apiDelete(path, options = {}) {
  return apiFetch(path, { ...options, method: 'DELETE' });
}

export async function apiUpload(path, formData, options = {}) {
  const { skipUnauthorized = false, ...fetchOptions } = options;
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    ...fetchOptions,
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorized && path !== '/api/auth/login' && unauthorizedHandler) {
      unauthorizedHandler({ path, status: 401 });
    }
    throw await readError(response);
  }
  return response;
}

export function filenameFromDisposition(disposition, fallback = 'arsip') {
  if (!disposition) return fallback;

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (encoded?.[1]) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      return fallback;
    }
  }

  const quoted = /filename="([^"]+)"/i.exec(disposition);
  if (quoted?.[1]) return quoted[1];
  return fallback;
}

export async function apiDownload(path, body, fallbackName = 'arsip', options = {}) {
  const { skipUnauthorized = false, ...fetchOptions } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {
    ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers ?? {}),
  };
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    ...fetchOptions,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401 && !skipUnauthorized && path !== '/api/auth/login' && unauthorizedHandler) {
      unauthorizedHandler({ path, status: 401 });
    }
    throw await readError(response);
  }

  const blob = await response.blob();
  return {
    blob,
    fileName: filenameFromDisposition(response.headers.get('content-disposition'), fallbackName),
    headers: response.headers,
  };
}
