import { useCallback, useEffect, useState } from 'react';
import { deleteArchive, downloadArchive, listArchives } from '../api/archives.js';
import AppFrame from '../components/AppFrame.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { downloadBlob, formatBytes } from '../lib/files.js';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function Archives() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [archives, setArchives] = useState([]);
  const [filters, setFilters] = useState({ q: '', tanggal: '' });
  const [applied, setApplied] = useState({ q: '', tanggal: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [downloadTarget, setDownloadTarget] = useState(null);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [downloadBusy, setDownloadBusy] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadArchives = useCallback(async (nextFilters = applied) => {
    setLoading(true);
    setError('');
    try {
      const payload = await listArchives(nextFilters);
      setArchives(Array.isArray(payload?.archives) ? payload.archives : []);
    } catch (requestError) {
      setError(requestError.message || 'Gagal memuat daftar arsip');
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => {
    loadArchives(applied);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitFilter = async (event) => {
    event.preventDefault();
    const next = { q: filters.q.trim(), tanggal: filters.tanggal };
    setApplied(next);
    await loadArchives(next);
  };

  const resetFilter = async () => {
    const next = { q: '', tanggal: '' };
    setFilters(next);
    setApplied(next);
    await loadArchives(next);
  };

  const openDownload = (archive) => {
    setDownloadTarget(archive);
    setDownloadPassword('');
    setDownloadError('');
  };

  const closeDownload = () => {
    if (downloadBusy) return;
    setDownloadTarget(null);
    setDownloadPassword('');
    setDownloadError('');
  };

  const submitDownload = async (event) => {
    event.preventDefault();
    if (!downloadTarget) return;
    setDownloadError('');
    if (downloadPassword.length < 8) {
      setDownloadError('Kunci minimal 8 karakter');
      setDownloadPassword('');
      return;
    }

    setDownloadBusy(true);
    try {
      const { blob, fileName } = await downloadArchive(
        downloadTarget.id,
        downloadPassword,
        downloadTarget.original_name || 'arsip',
      );
      downloadBlob(blob, fileName);
      setDownloadTarget(null);
      setDownloadPassword('');
      setDownloadError('');
    } catch (requestError) {
      if (requestError?.status === 403) {
        setDownloadError(requestError.message || 'Anda tidak memiliki akses ke arsip ini');
      } else {
        setDownloadError(requestError.message || 'Gagal mendekripsi arsip');
      }
    } finally {
      setDownloadPassword('');
      setDownloadBusy(false);
    }
  };

  const openDelete = (archive) => {
    setDeleteTarget(archive);
    setDeleteError('');
  };

  const closeDelete = () => {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await deleteArchive(deleteTarget.id);
      setDeleteTarget(null);
      await loadArchives(applied);
    } catch (requestError) {
      if (requestError?.status === 403) {
        setDeleteError(requestError.message || 'Anda tidak memiliki akses untuk menghapus arsip ini');
      } else {
        setDeleteError(requestError.message || 'Gagal menghapus arsip');
      }
    } finally {
      setDeleteBusy(false);
    }
  };

  const colCount = isAdmin ? 7 : 6;

  return (
    <AppFrame>
      <PageHero
        eyebrow="Daftar arsip"
        title="Kelola arsip terenkripsi Anda."
        description="Cari, unduh dengan dekripsi, atau hapus arsip sesuai hak akses Anda."
        chips={[
          { icon: 'file', label: 'Arsip', value: String(archives.length) },
          { icon: 'shield', label: 'Akses', value: isAdmin ? 'Admin: semua arsip' : 'Pegawai: arsip sendiri' },
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
              <h2>Cari arsip</h2>
              <p>Filter berdasarkan nama arsip atau tanggal unggah.</p>
            </div>
          </div>

          <form className="filter-bar" onSubmit={submitFilter}>
            <div className="field">
              <label htmlFor="archive-q">Nama arsip</label>
              <input
                id="archive-q"
                className="input"
                type="search"
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Cari nama arsip..."
              />
            </div>
            <div className="field">
              <label htmlFor="archive-date">Tanggal</label>
              <input
                id="archive-date"
                className="input"
                type="date"
                value={filters.tanggal}
                onChange={(e) => setFilters((f) => ({ ...f, tanggal: e.target.value }))}
              />
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
              <h2>Daftar arsip</h2>
              <p>{isAdmin ? 'Semua arsip terenkripsi di sistem.' : 'Arsip terenkripsi milik Anda.'}</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama arsip</th>
                  <th>Jenis</th>
                  <th>Ukuran asli</th>
                  <th>Ukuran terenkripsi</th>
                  <th>Tanggal unggah</th>
                  {isAdmin ? <th>Pemilik</th> : null}
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colCount} className="table-empty">Memuat arsip...</td></tr>
                ) : archives.length === 0 ? (
                  <tr><td colSpan={colCount} className="table-empty">Tidak ada arsip ditemukan.</td></tr>
                ) : (
                  archives.map((archive) => (
                    <tr key={archive.id}>
                      <td>{archive.original_name}</td>
                      <td><span className="status-pill">{String(archive.file_ext || '-').replace('.', '').toUpperCase()}</span></td>
                      <td>{formatBytes(archive.original_size)}</td>
                      <td>{formatBytes(archive.encrypted_size)}</td>
                      <td>{formatDateTime(archive.created_at)}</td>
                      {isAdmin ? <td>{archive.username || '-'}</td> : null}
                      <td>
                        <div className="table-actions">
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => openDownload(archive)}>
                            <Icon name="download" size={15} /> Unduh
                          </button>
                          <button type="button" className="btn btn--danger btn--sm" onClick={() => openDelete(archive)}>
                            <Icon name="trash" size={15} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {downloadTarget ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="download-title">
          <div className="modal card">
            <div className="card-heading">
              <span className="section-marker" aria-hidden="true"><Icon name="download" size={18} /></span>
              <div>
                <h2 id="download-title">Dekripsi dan unduh</h2>
                <p>Masukkan kunci untuk mendekripsi <strong>{downloadTarget.original_name}</strong>.</p>
              </div>
            </div>

            {downloadError ? (
              <div className="alert" role="alert">
                <Icon name="alert" size={18} />
                <p>{downloadError}</p>
              </div>
            ) : null}

            <form onSubmit={submitDownload} noValidate>
              <PasswordField
                id="download-password"
                label="Kunci dekripsi"
                value={downloadPassword}
                onChange={(e) => setDownloadPassword(e.target.value)}
                disabled={downloadBusy}
                autoComplete="off"
                hint="Kata sandi dikosongkan setelah setiap percobaan."
              />
              <div className="form-actions form-actions--row">
                <button className="btn btn--primary" type="submit" disabled={downloadBusy}>
                  {downloadBusy ? <><span className="spinner" aria-hidden="true" /> Memproses...</> : 'Dekripsi dan unduh'}
                </button>
                <button className="btn btn--ghost" type="button" onClick={closeDownload} disabled={downloadBusy}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="modal card">
            <div className="card-heading">
              <span className="section-marker" aria-hidden="true"><Icon name="trash" size={18} /></span>
              <div>
                <h2 id="delete-title">Hapus arsip</h2>
                <p>Arsip <strong>{deleteTarget.original_name}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            {deleteError ? (
              <div className="alert" role="alert">
                <Icon name="alert" size={18} />
                <p>{deleteError}</p>
              </div>
            ) : null}

            <div className="form-actions form-actions--row">
              <button className="btn btn--danger" type="button" onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? <><span className="spinner" aria-hidden="true" /> Menghapus...</> : 'Hapus arsip'}
              </button>
              <button className="btn btn--ghost" type="button" onClick={closeDelete} disabled={deleteBusy}>Batal</button>
            </div>
          </div>
        </div>
      ) : null}
    </AppFrame>
  );
}
