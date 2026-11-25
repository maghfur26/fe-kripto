import { useState } from 'react';
import { apiPost } from '../api/client.js';
import AppFrame from '../components/AppFrame.jsx';
import Icon from '../components/Icon.jsx';
import PageHero from '../components/PageHero.jsx';
import SimulasiForm from '../components/SimulasiForm.jsx';
import SimulasiResult from '../components/SimulasiResult.jsx';

const DEFAULTS = {
  text: '%PDF',
  playfairKeyword: 'MONARCHY',
  aesKeyHex: '2b7e151628aed2a6abf7158809cf4f3c',
  ivHex: '000102030405060708090a0b0c0d0e0f',
};

function EmptySimulasi() {
  return (
    <section className="empty-state" aria-labelledby="empty-title">
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__ring" />
        <span className="empty-state__icon">
          <Icon name="layers" size={34} />
        </span>
        <span className="empty-state__tag empty-state__tag--one">byte</span>
        <span className="empty-state__tag empty-state__tag--two">playfair</span>
        <span className="empty-state__tag empty-state__tag--three">aes</span>
      </div>
      <p className="eyebrow">Ruang hasil</p>
      <h2 id="empty-title">Jalankan simulasi pertama</h2>
      <p>
        Jejak perhitungan akan muncul di sini: konversi byte, matriks Playfair, ronde AES,
        dekripsi, sampai pencocokan dengan <code>node:crypto</code>.
      </p>
      <ul className="empty-facts">
        <li>
          <Icon name="check" size={15} /> 9 langkah manual
        </li>
        <li>
          <Icon name="check" size={15} /> 5 vektor uji
        </li>
        <li>
          <Icon name="check" size={15} /> Status Cocok
        </li>
      </ul>
    </section>
  );
}

function LoadingState() {
  return (
    <section className="sim-loading" aria-label="Menghitung simulasi">
      <span className="spinner spinner--large" aria-hidden="true" />
      <h2>Menghitung jejak langkah…</h2>
      <p>Menjalankan Playfair, AES edukasi, dan pembanding node:crypto.</p>
    </section>
  );
}

export default function Simulasi() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await apiPost('/api/simulasi', form);
      setResult(response);
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppFrame>
      <PageHero
        eyebrow="Ruang simulasi — KF-11"
        title="Bedah setiap byte, tanpa kotak hitam."
        description="Masukkan teks pendek, kata kunci Playfair, kunci AES, dan IV. Aplikasi menampilkan seluruh perhitungan manual lalu membandingkannya dengan modul kripto yang dipakai untuk arsip nyata."
        chips={[
          { icon: 'layers', label: 'Langkah', value: '9 tahap' },
          { icon: 'terminal', label: 'Pembanding', value: 'node:crypto' },
          { icon: 'hash', label: 'Status akhir', value: 'Cocok' },
        ]}
      >
        <p className="hero-note">
          <Icon name="info" size={16} />
          Simulasi memakai kunci langsung agar bisa dihitung manual; PBKDF2 tidak ditampilkan.
        </p>
      </PageHero>

      <div className="sim-workspace">
        <SimulasiForm
          form={form}
          onChange={update}
          onSubmit={submit}
          loading={loading}
          error={error}
        />
        <section className="sim-output" aria-live="polite" aria-busy={loading}>
          {loading && !result ? <LoadingState /> : null}
          {!loading && !result ? <EmptySimulasi /> : null}
          {result ? <SimulasiResult result={result} /> : null}
        </section>
      </div>
    </AppFrame>
  );
}
