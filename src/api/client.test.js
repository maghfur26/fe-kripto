import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, apiGet, apiPost, apiPatch, apiDelete, setUnauthorizedHandler } from './client.js';

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  setUnauthorizedHandler(null);
});

describe('api client', () => {
  it('includes credentials and parses json', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    });
    const data = await apiGet('/api/test');
    expect(data).toEqual({ ok: true });
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ credentials: 'include' }));
  });

  it('prefixes relative paths with VITE_API_BASE_URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com/');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    });
    await apiGet('/api/test');
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/api/test', expect.anything());
  });

  it('calls unauthorized handler on 401 and throws status', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Unauthorized' }),
    });
    await expect(apiPost('/api/secret', { a: 1 })).rejects.toMatchObject({ status: 401 });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('does not call unauthorized handler for login 401', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Nama pengguna atau kata sandi salah' }),
    });
    await expect(apiPost('/api/auth/login', { username: 'x', password: 'y' })).rejects.toMatchObject({ status: 401 });
    expect(handler).not.toHaveBeenCalled();
  });

  it('exports patch and delete helpers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ ok: true }),
    });
    await apiPatch('/api/x', { a: 1 });
    await apiDelete('/api/x');
    expect(global.fetch.mock.calls[0][1].method).toBe('PATCH');
    expect(global.fetch.mock.calls[1][1].method).toBe('DELETE');
  });
});
