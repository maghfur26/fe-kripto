import Icon from './Icon.jsx';

export default function SimulasiForm({ form, onChange, onSubmit, loading, error }) {
  return (
    <aside className="control-panel" aria-labelledby="panel-title">
      <div className="control-panel__head">
        <div>
          <p className="panel-kicker">Parameter</p>
          <h2 id="panel-title">Simulasi baru</h2>
        </div>
        <span className="badge badge--outline">KF-11</span>
      </div>

      <form className="sim-form" onSubmit={onSubmit}>
        <fieldset className="fieldset">
          <legend className="fieldset__legend">
            <Icon name="layers" size={16} />
            Lapis Playfair
          </legend>

          <div className="field">
            <div className="field__label-row">
              <label htmlFor="sim-text">Teks</label>
              <span className="field__limit">maks. 8</span>
            </div>
            <input
              id="sim-text"
              className="input"
              value={form.text}
              onChange={onChange('text')}
              maxLength={8}
              autoComplete="off"
              required
              aria-describedby="sim-text-hint"
            />
            <span className="field__hint" id="sim-text-hint">
              Karakter ASCII, misalnya <code>%PDF</code>.
            </span>
          </div>

          <div className="field">
            <label htmlFor="sim-keyword">Kata kunci Playfair</label>
            <input
              id="sim-keyword"
              className="input"
              value={form.playfairKeyword}
              onChange={onChange('playfairKeyword')}
              autoComplete="off"
              spellCheck={false}
              required
              aria-describedby="sim-keyword-hint"
            />
            <span className="field__hint" id="sim-keyword-hint">
              4–16 huruf A–Z. Huruf J dianggap I.
            </span>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset__legend">
            <Icon name="key" size={16} />
            Lapis AES-128-CBC
          </legend>

          <div className="field">
            <label htmlFor="sim-aes-key">Kunci AES-128</label>
            <input
              id="sim-aes-key"
              className="input input--mono"
              value={form.aesKeyHex}
              onChange={onChange('aesKeyHex')}
              autoComplete="off"
              spellCheck={false}
              required
              aria-describedby="sim-aes-key-hint"
            />
            <span className="field__hint" id="sim-aes-key-hint">
              16 byte heksadesimal.
            </span>
          </div>

          <div className="field">
            <label htmlFor="sim-iv">Vektor inisialisasi (IV)</label>
            <input
              id="sim-iv"
              className="input input--mono"
              value={form.ivHex}
              onChange={onChange('ivHex')}
              autoComplete="off"
              spellCheck={false}
              required
              aria-describedby="sim-iv-hint"
            />
            <span className="field__hint" id="sim-iv-hint">
              16 byte heksadesimal, dipakai untuk blok pertama.
            </span>
          </div>
        </fieldset>

        {error ? (
          <div className="alert alert--error" role="alert">
            <Icon name="alert" size={18} />
            <p>{error}</p>
          </div>
        ) : null}

        <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Menghitung…
            </>
          ) : (
            <>
              <Icon name="play" size={18} />
              Jalankan simulasi
            </>
          )}
        </button>
      </form>

      <div className="panel-note">
        <Icon name="info" size={18} />
        <p>
          Simulasi memakai kata kunci dan kunci AES secara langsung agar bisa dihitung manual.
          PBKDF2 tidak ditampilkan di sini karena simulasi fokus pada jejak Playfair dan AES.
        </p>
      </div>
    </aside>
  );
}
