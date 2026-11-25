import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

function navLinks(role) {
  const links = [
    { to: '/dashboard', label: 'Dasbor', icon: 'dashboard' },
    { to: '/upload', label: 'Unggah', icon: 'upload' },
    { to: '/archives', label: 'Arsip', icon: 'file' },
    { to: '/simulasi', label: 'Simulasi', icon: 'terminal' },
  ];
  if (role === 'admin') {
    links.push(
      { to: '/users', label: 'Manajemen Pengguna', icon: 'users' },
      { to: '/logs', label: 'Log Aktivitas', icon: 'activity' },
    );
  }
  return links;
}

export default function AppHeader() {
  const { user, logout } = useAuth();
  const links = navLinks(user?.role);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // AuthContext clears user in finally; ignore transport error on logout.
    }
  };

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link className="brand" to="/dashboard" aria-label="Arsip Digital, dasbor">
          <span className="brand__mark">
            <Icon name="shield" size={22} />
          </span>
          <span className="brand__text">
            <strong>Arsip Digital</strong>
            <small>Ruang kerja terenkripsi</small>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Navigasi utama">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
            >
              <Icon name={link.icon} size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <div className="site-status" title={user?.role === 'admin' ? 'Masuk sebagai admin' : 'Masuk sebagai pegawai'}>
            <span className="site-status__dot" aria-hidden="true" />
            {user?.username || 'Pengguna'}
          </div>
          <button type="button" className="btn btn--soft btn--sm" onClick={handleLogout}>
            <Icon name="logOut" size={16} />
            Keluar
          </button>
        </div>
      </div>
    </header>
  );
}
