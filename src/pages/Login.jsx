import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Nama pengguna atau kata sandi salah');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || loading;

  return (
    <div className="login-page">
      <a className="skip-link" href="#login-main">Lewati ke konten utama</a>
      <main id="login-main" className="login-shell">
        <section className="login-brand-panel" aria-label="Informasi aplikasi">
          <div className="login-brand-panel__inner">
            <p className="eyebrow">Arsip Digital Aman</p>
            <h1>Masuk ke ruang kerja arsip terenkripsi.</h1>
            <p className="login-brand-panel__lead">
              Kelola arsip digital dengan alur Playfair + AES, kendali peran, dan jejak aktivitas.
            </p>
            <ul className="check-bullets login-brand-panel__bullets">
              <li><Icon name="check" size={16} /> Akses berbasis peran admin dan pegawai</li>
              <li><Icon name="check" size={16} /> Arsip terenkripsi dan audit aktivitas</li>
              <li><Icon name="check" size={16} /> Simulasi kripto untuk kebutuhan akademik</li>
            </ul>
          </div>
        </section>

        <section className="login-form-panel" aria-labelledby="login-title">
          <div className="card login-card">
            <div className="login-card__brand">
              <span className="brand__mark"><Icon name="shield" size={22} /></span>
              <div>
                <p className="login-card__app">Arsip Digital</p>
                <p className="login-card__sub">Masuk dengan akun Anda</p>
              </div>
            </div>

            <div className="card-heading">
              <span className="section-marker" aria-hidden="true">01</span>
              <div>
                <h2 id="login-title">Masuk</h2>
                <p>Gunakan nama pengguna dan kata sandi yang terdaftar.</p>
              </div>
            </div>

            {error ? (
              <div className="alert" role="alert">
                <Icon name="alert" size={18} />
                <p>{error}</p>
              </div>
            ) : null}

            <form onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="username">Nama pengguna</label>
                <input
                  id="username"
                  className="input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={busy}
                  required
                />
              </div>

              <PasswordField
                id="password"
                label="Kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
                autoComplete="current-password"
              />

              <div className="form-actions">
                <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
                  {submitting ? <><span className="spinner" aria-hidden="true" /> Memproses...</> : 'Masuk'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
