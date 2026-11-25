import { useState } from 'react';
import { uploadArchive } from '../api/archives.js';
import AppFrame from '../components/AppFrame.jsx';
import FileDrop from '../components/FileDrop.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { ACCEPT_ARCHIVE, formatBytes, validateArchiveFile } from '../lib/files.js';

const FLOW = [
  { title: 'Baca berkas', text: 'Berkas divalidasi, lalu dikonversi ke byte untuk proses kripto.' },
  { title: 'Lapis Playfair', text: 'Byte dinormalisasi dan dienkripsi dengan matriks Playfair 5x5.' },
  { title: 'Lapis AES-128-CBC', text: 'Hasil Playfair dienkripsi lagi dengan AES-128-CBC.' },
  { title: 'Simpan arsip', text: 'Kontainer terenkripsi disimpan di database dan storage server.' },
];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const chooseFile = (nextFile) => {
    setError('');
    setSuccess('');
    if (!nextFile) {
      setFile(null);
      return;
    }
    const message = validateArchiveFile(nextFile);
    if (message) {
      setError(message);
      setFile(null);
      return;
    }
    setFile(nextFile);
  };

  const clearPasswords = () => {
    setPassword('');
    setPasswordConfirm('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const fileMessage = validateArchiveFile(file);
    if (fileMessage) {
      setError(fileMessage);
      clearPasswords();
      return;
    }
    if (password.length < 8) {
      setError('Kunci minimal 8 karakter');
      clearPasswords();
      return;
    }
    if (password !== passwordConfirm) {
      setError('Konfirmasi kunci belum sama');
      clearPasswords();
      return;
    }

    setLoading(true);
    try {
      const payload = await uploadArchive({ file, password, passwordConfirm });
      const name = payload?.archive?.original_name || file.name;
      setSuccess(`Arsip "${name}" berhasil dienkripsi dan disimpan.`);
      setFile(null);
    } catch (requestError) {
      setError(requestError.message || 'Gagal mengunggah arsip');
    } finally {
      clearPasswords();
      setLoading(false);
    }
  };

  return (
    <AppFrame>
      <PageHero
        eyebrow="Unggah arsip"
        title="Enkripsi dan simpan arsip baru."
        description="Unggah berkas kantor, kunci dengan kata sandi Anda, lalu simpan sebagai arsip terenkripsi."
        chips={[
          { icon: 'upload', label: 'Masukan', value: 'Berkas arsip' },
          { icon: 'lock', label: 'Proteksi', value: 'Playfair + AES' },
          { icon: 'shield', label: 'Ukuran maks.', value: '5 MB' },
        ]}
      />

      <div className="crypto-grid">
        <form className="card crypto-card" onSubmit={submit} noValidate aria-busy={loading}>
          <div className="card-heading">
            <span className="section-marker" aria-hidden="true">01</span>
            <div>
              <h2>Berkas dan kunci</h2>
              <p>Pilih satu arsip dan tentukan kunci enkripsi.</p>
            </div>
          </div>

          <div className="field">
            <span className="field__label">Berkas arsip</span>
            <FileDrop
              file={file}
              onFile={chooseFile}
              accept={ACCEPT_ARCHIVE}
              hint="PDF, DOC, DOCX, XLS, XLSX, PPT, atau PPTX · maks. 5 MB"
              disabled={loading}
            />
          </div>

          <div className="field-grid">
            <PasswordField
              label="Kunci enkripsi"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="Minimal 8 karakter."
              autoComplete="new-password"
              disabled={loading}
            />
            <PasswordField
              label="Konfirmasi kunci"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              hint="Harus sama dengan kunci di samping."
              autoComplete="new-password"
              disabled={loading}
              name="passwordConfirm"
            />
          </div>

          <div className="form-note">
            <Icon name="info" size={18} />
            <p>
              Kunci tidak disimpan. Jika kunci hilang, arsip tidak dapat dipulihkan. Kata sandi
              dikosongkan dari formulir setelah proses selesai.
            </p>
          </div>

          {error ? (
            <div className="alert" role="alert">
              <Icon name="alert" size={18} />
              <p>{error}</p>
            </div>
          ) : null}

          {success ? (
            <div className="success-panel" role="status">
              <span className="success-panel__icon"><Icon name="fileCheck" size={22} /></span>
              <div className="success-panel__copy">
                <p className="success-panel__kicker">Unggah berhasil</p>
                <h3>Arsip tersimpan</h3>
                <p>{success}</p>
              </div>
            </div>
          ) : null}

          <div className="form-actions">
            <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Memproses...
                </>
              ) : (
                <>
                  <Icon name="lock" size={18} />
                  Enkripsi dan simpan arsip
                </>
              )}
            </button>
            <p className="form-actions__hint">
              {file ? `Berkas terpilih: ${file.name} (${formatBytes(file.size)})` : 'Belum ada berkas dipilih.'}
            </p>
          </div>
        </form>

        <aside className="side-stack" aria-label="Informasi proses unggah">
          <section className="card side-card">
            <p className="panel-kicker">Alur proses</p>
            <h2>Proses enkripsi arsip</h2>
            <ol className="process-list">
              {FLOW.map((item, index) => (
                <li key={item.title} className="process-list__item">
                  <span className="process-list__index">{index + 1}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card side-card side-card--dark">
            <span className="side-card__icon"><Icon name="shield" size={22} /></span>
            <h3>Peringatan kunci</h3>
            <p>
              Sistem tidak menyimpan kunci enkripsi. Simpan kunci Anda dengan aman; tanpa kunci,
              arsip tidak dapat didekripsi kembali.
            </p>
            <ul className="check-bullets">
              <li><Icon name="check" size={15} /> Kunci tidak disimpan di server</li>
              <li><Icon name="check" size={15} /> Kunci tidak disimpan di browser</li>
              <li><Icon name="check" size={15} /> Integritas dijaga dengan SHA-256</li>
            </ul>
          </section>
        </aside>
      </div>
    </AppFrame>
  );
}
