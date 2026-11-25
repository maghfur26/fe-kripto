import { useEffect, useState } from 'react';
import { getDashboard } from '../api/dashboard.js';
import AppFrame from '../components/AppFrame.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
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

function resultBadge(result) {
  const ok = result === 'success';
  return (
    <span className={`status-pill ${ok ? 'is-success' : 'is-danger'}`}>
      {ok ? 'Berhasil' : 'Gagal'}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getDashboard()
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Gagal memuat dasbor');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = user?.role === 'admin';
  const activities = Array.isArray(data?.recentActivities) ? data.recentActivities : [];

  return (
    <AppFrame>
      <PageHero
        eyebrow="Dasbor"
        title={`Selamat datang, ${user?.username || 'pengguna'}.`}
        description="Ringkasan arsip dan aktivitas terbaru sesuai hak akses Anda."
        chips={[
          { icon: 'shield', label: 'Peran', value: isAdmin ? 'Admin' : 'Pegawai' },
          { icon: 'file', label: 'Total arsip', value: String(data?.archiveCount ?? 0) },
          { icon: 'activity', label: 'Aktivitas', value: `${activities.length} terbaru` },
        ]}
      />

      <div className="shell dashboard-page">
        {error ? (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <p>{error}</p>
          </div>
        ) : null}

        <section className="summary-grid" aria-label="Ringkasan">
          <article className="card summary-card">
            <div className="summary-card__icon"><Icon name="file" size={20} /></div>
            <div>
              <p className="summary-card__label">Total arsip</p>
              <p className="summary-card__value">{loading ? '...' : data?.archiveCount ?? 0}</p>
              <p className="summary-card__hint">{isAdmin ? 'Seluruh arsip di sistem' : 'Arsip milik Anda'}</p>
            </div>
          </article>
          <article className="card summary-card">
            <div className="summary-card__icon"><Icon name="activity" size={20} /></div>
            <div>
              <p className="summary-card__label">Aktivitas terbaru</p>
              <p className="summary-card__value">{loading ? '...' : activities.length}</p>
              <p className="summary-card__hint">Maksimal 5 aktivitas terakhir</p>
            </div>
          </article>
          <article className="card summary-card">
            <div className="summary-card__icon"><Icon name="users" size={20} /></div>
            <div>
              <p className="summary-card__label">Akses</p>
              <p className="summary-card__value">{isAdmin ? 'Admin' : 'Pegawai'}</p>
              <p className="summary-card__hint">{isAdmin ? 'Dapat mengelola pengguna dan log' : 'Dapat mengelola arsip sendiri'}</p>
            </div>
          </article>
        </section>

        <section className="card crypto-card">
          <div className="card-heading">
            <span className="section-marker" aria-hidden="true">01</span>
            <div>
              <h2>Aktivitas terbaru</h2>
              <p>{isAdmin ? 'Lima aktivitas terakhir dari seluruh pengguna.' : 'Lima aktivitas terakhir Anda.'}</p>
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
                  <tr>
                    <td colSpan="5" className="table-empty">Memuat aktivitas...</td>
                  </tr>
                ) : activities.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="table-empty">Belum ada aktivitas.</td>
                  </tr>
                ) : (
                  activities.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDateTime(item.created_at ?? item.createdAt)}</td>
                      <td>{item.username || '-'}</td>
                      <td>{activityLabel(item.activity)}</td>
                      <td>{item.original_name ?? item.archiveName ?? '-'}</td>
                      <td>{resultBadge(item.result)}</td>
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
