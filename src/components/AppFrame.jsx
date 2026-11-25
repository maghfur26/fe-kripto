import AppHeader from './AppHeader.jsx';

export default function AppFrame({ children }) {
  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">
        Lewati ke konten utama
      </a>
      <AppHeader />
      <main id="main-content" className="page">
        {children}
      </main>
      <footer className="site-footer">
        <div className="shell site-footer__inner">
          <span>Playfair 5×5 + AES-128-CBC</span>
          <span>PBKDF2-SHA256 · 100.000 iterasi</span>
          <span>Akses berbasis peran</span>
        </div>
      </footer>
    </div>
  );
}
