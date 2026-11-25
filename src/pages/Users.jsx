import { useCallback, useEffect, useState } from 'react';
import { createUser, listUsers, updateUser } from '../api/users.js';
import AppFrame from '../components/AppFrame.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';
import PasswordField from '../components/PasswordField.jsx';

const EMPTY_CREATE = { username: '', password: '', role: 'pegawai' };

function normalizeUser(user) {
  return {
    ...user,
    is_active: Boolean(user?.is_active),
  };
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date);
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createForm, setCreateForm] = useState(EMPTY_CREATE);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '', role: 'pegawai', is_active: true });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState('');
  const [rowBusyId, setRowBusyId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await listUsers();
      const items = Array.isArray(payload?.users) ? payload.users : Array.isArray(payload) ? payload : [];
      setUsers(items.map(normalizeUser));
    } catch (requestError) {
      setError(requestError.message || 'Gagal memuat pengguna');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditError('');
    setEditForm({
      username: user.username || '',
      password: '',
      role: user.role || 'pegawai',
      is_active: Boolean(user.is_active),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditError('');
    setEditForm({ username: '', password: '', role: 'pegawai', is_active: true });
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setCreateError('');
    setCreateBusy(true);
    try {
      await createUser({
        username: createForm.username.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      setCreateForm(EMPTY_CREATE);
      await loadUsers();
    } catch (requestError) {
      setCreateError(requestError.message || 'Gagal menambah pengguna');
    } finally {
      setCreateBusy(false);
    }
  };

  const submitEdit = async (event) => {
    event.preventDefault();
    if (!editingId) return;
    setEditError('');
    setEditBusy(true);
    try {
      const payload = {
        username: editForm.username.trim(),
        role: editForm.role,
        is_active: editForm.is_active,
      };
      if (editForm.password) payload.password = editForm.password;
      await updateUser(editingId, payload);
      cancelEdit();
      await loadUsers();
    } catch (requestError) {
      setEditError(requestError.message || 'Gagal memperbarui pengguna');
    } finally {
      setEditBusy(false);
    }
  };

  const deactivate = async (user) => {
    if (!user?.is_active) return;
    const ok = window.confirm(`Nonaktifkan pengguna "${user.username}"?`);
    if (!ok) return;
    setRowBusyId(user.id);
    setError('');
    try {
      await updateUser(user.id, { is_active: false });
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Gagal menonaktifkan pengguna');
    } finally {
      setRowBusyId(null);
    }
  };

  return (
    <AppFrame>
      <PageHero
        eyebrow="Manajemen pengguna"
        title="Kelola akun pengguna sistem."
        description="Tambah akun baru, perbarui peran, ubah kata sandi, atau nonaktifkan pengguna."
        chips={[
          { icon: 'users', label: 'Akses', value: 'Admin saja' },
          { icon: 'shield', label: 'Total', value: String(users.length) },
        ]}
      />

      <div className="shell admin-page">
        {error ? (
          <div className="alert" role="alert">
            <Icon name="alert" size={18} />
            <p>{error}</p>
          </div>
        ) : null}

        <div className="admin-grid">
          <section className="card crypto-card">
            <div className="card-heading">
              <span className="section-marker" aria-hidden="true">01</span>
              <div>
                <h2>{editingId ? 'Edit pengguna' : 'Tambah pengguna'}</h2>
                <p>{editingId ? 'Perbarui data akun. Kosongkan kata sandi jika tidak ingin mengubahnya.' : 'Buat akun admin atau pegawai baru.'}</p>
              </div>
            </div>

            {editingId ? (
              <form onSubmit={submitEdit} noValidate>
                {editError ? <div className="alert" role="alert"><Icon name="alert" size={18} /><p>{editError}</p></div> : null}
                <div className="field">
                  <label htmlFor="edit-username">Nama pengguna</label>
                  <input id="edit-username" className="input" value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} disabled={editBusy} required />
                </div>
                <PasswordField id="edit-password" label="Kata sandi baru (opsional)" value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} disabled={editBusy} hint="Kosongkan jika tidak mengubah kata sandi." required={false} />
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="edit-role">Peran</label>
                    <select id="edit-role" className="input" value={editForm.role} onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))} disabled={editBusy}>
                      <option value="pegawai">Pegawai</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="edit-active">Status</label>
                    <select id="edit-active" className="input" value={editForm.is_active ? 'active' : 'inactive'} onChange={(e) => setEditForm((f) => ({ ...f, is_active: e.target.value === 'active' }))} disabled={editBusy}>
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions form-actions--row">
                  <button className="btn btn--primary" type="submit" disabled={editBusy}>
                    {editBusy ? <><span className="spinner" aria-hidden="true" /> Menyimpan...</> : 'Simpan perubahan'}
                  </button>
                  <button className="btn btn--ghost" type="button" onClick={cancelEdit} disabled={editBusy}>Batal</button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitCreate} noValidate>
                {createError ? <div className="alert" role="alert"><Icon name="alert" size={18} /><p>{createError}</p></div> : null}
                <div className="field">
                  <label htmlFor="create-username">Nama pengguna</label>
                  <input id="create-username" className="input" value={createForm.username} onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))} disabled={createBusy} required />
                </div>
                <PasswordField id="create-password" label="Kata sandi" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} disabled={createBusy} autoComplete="new-password" hint="Minimal 8 karakter." />
                <div className="field">
                  <label htmlFor="create-role">Peran</label>
                  <select id="create-role" className="input" value={createForm.role} onChange={(e) => setCreateForm((f) => ({ ...f, role: e.target.value }))} disabled={createBusy}>
                    <option value="pegawai">Pegawai</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="btn btn--primary btn--block" type="submit" disabled={createBusy}>
                    {createBusy ? <><span className="spinner" aria-hidden="true" /> Menambah...</> : 'Tambah pengguna'}
                  </button>
                </div>
              </form>
            )}
          </section>

          <section className="card crypto-card">
            <div className="card-heading">
              <span className="section-marker" aria-hidden="true">02</span>
              <div>
                <h2>Daftar pengguna</h2>
                <p>Kelola status dan peran pengguna yang terdaftar.</p>
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nama pengguna</th>
                    <th>Peran</th>
                    <th>Status</th>
                    <th>Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="table-empty">Memuat pengguna...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan="5" className="table-empty">Belum ada pengguna.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td><span className="status-pill">{user.role === 'admin' ? 'Admin' : 'Pegawai'}</span></td>
                        <td>
                          <span className={`status-pill ${user.is_active ? 'is-success' : 'is-danger'}`}>
                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at ?? user.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => startEdit(user)} disabled={rowBusyId === user.id || editBusy}>
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn--danger btn--sm"
                              onClick={() => deactivate(user)}
                              disabled={!user.is_active || rowBusyId === user.id || editBusy}
                            >
                              {rowBusyId === user.id ? '...' : 'Nonaktifkan'}
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
      </div>
    </AppFrame>
  );
}
