import { useCallback, useEffect, useState } from 'react';
import { listLogs } from '../api/logs.js';
import { listUsers } from '../api/users.js';
import AppFrame from '../components/AppFrame.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function activityLabel(activity) {
  const labels = {
    login: 'Masuk',
    upload_archive: 'Unggah arsip',
    download_archive: 'Unduh arsip',
    delete_archive: 'Hapus arsip',
  };
  return labels[activity] || activity || '-';
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ tanggal: '', userId: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const payload = await listUsers();
      const items = Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : [];
      setUsers(items);
    } catch {
      // Filters still usable without user dropdown options.
    }
  }, []);

  const loadLogs = useCallback(async (activeFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeFilters.tanggal) params.tanggal = activeFilters.tanggal;
      if (activeFilters.userId) params.userId = activeFilters.userId;
      const payload = await listLogs(params);
      const items = Array.isArray(payload?.logs) ? payload.logs : Array.isArray(payload) ? payload : [];
      setLogs(items);
    } catch (requestError) {
      setError(requestError.message || 'Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadLogs(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitFilter = async (event) => {
    event.preventDefault();
    await loadLogs(filters);
  };

  const resetFilter = async () => {
    const next = { tanggal: '', userId: '' };
    setFilters(next);
    await loadLogs(next);
  };

  return (
    <AppFrame>
      <PageHero
        eyebrow="Log aktivitas"
        title="Pantau jejak aktivitas sistem."
        description="Filter log berdasarkan tanggal atau pengguna untuk audit aktivitas."
        chips={[
          { icon: 'terminal', label: 'Akses', value: 'Admin saja' },
          { icon: 'activity', label: 'Log', value: String(logs.length) },
        ]}
      />

      <div className="shell admin-page">
        {error ? (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <p>{error}</p>
          </div>
        ) : null}

        <section className="card crypto-card">
          <div className="card-heading">
            <span className="section-marker" aria-hidden="true">01</span>
            <div>
              <h2>Filter log</h2>
              <p>Pilih tanggal dan/atau pengguna untuk mempersempit hasil.</p>
            </div>
          </div>

          <form className="filter-bar" onSubmit={submitFilter}>
            <div className="field">
              <label htmlFor="log-date">Tanggal</label>
              <input
                id="log-date"
                className="input"
                type="date"
                value={filters.tanggal}
                onChange={(e) => setFilters((f) => ({ ...f, tanggal: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="log-user">Pengguna</label>
              <select
                id="log-user"
                className="input"
                value={filters.userId}
                onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
              >
                <option value="">Semua pengguna</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <div className="filter-bar__actions">
              <button className="btn btn--primary" type="submit" disabled={loading}>Terapkan</button>
              <button className="btn btn--ghost" type="button" onClick={resetFilter} disabled={loading}>Reset</button>
            </div>
          </form>
        </section>

        <section className="card crypto-card">
          <div className="card-heading">
            <span className="section-marker" aria-hidden="true">02</span>
            <div>
              <h2>Daftar log aktivitas</h2>
              <p>Riwayat aktivitas pengguna pada sistem arsip digital.</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aktivitas</th>
                  <th>Arsip</th>
                  <th>Hasil</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="table-empty">Memuat log...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan="5" className="table-empty">Tidak ada log untuk filter ini.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.created_at ?? log.createdAt)}</td>
                      <td>{log.username || '-'}</td>
                      <td>{activityLabel(log.activity)}</td>
                      <td>{log.original_name ?? log.archiveName ?? '-'}</td>
                      <td>
                        <span className={`status-pill ${log.result === 'success' ? 'is-success' : 'is-danger'}`}>
                          {log.result === 'success' ? 'Berhasil' : 'Gagal'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppFrame>
  );
}
