import Icon from './Icon.jsx';
import MatrixTable from './MatrixTable.jsx';
import Pipeline from './Pipeline.jsx';
import StepCard from './StepCard.jsx';

function HexInline({ value }) {
  return <code className="hex-inline">{value}</code>;
}

function Table({ caption, columns, rows }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label={caption}>
      <table className="data-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Disclosure({ summary, children, open = false }) {
  return (
    <details className="disclosure" open={open}>
      <summary>
        <span>{summary}</span>
        <Icon name="chevron" size={16} className="disclosure__chevron" />
      </summary>
      <div className="disclosure__body">{children}</div>
    </details>
  );
}

function AesBlockDetail({ block }) {
  const hasDetail = Boolean(block.addRoundKey);
  return (
    <article className="aes-block">
      <div className="aes-block__head">
        <h4>Blok {block.index}</h4>
        <span className="badge badge--soft">{block.ciphertextHex.length / 2} byte</span>
      </div>

      <dl className="detail-grid">
        <div>
          <dt>Plaintext blok</dt>
          <dd>
            <HexInline value={block.plaintextHex} />
          </dd>
        </div>
        <div>
          <dt>XOR dengan {block.index === 1 ? 'IV' : 'ciphertext sebelumnya'}</dt>
          <dd>
            <HexInline value={block.xorWithPrev.prevHex} /> → <HexInline value={block.xorWithPrev.xorHex} />
          </dd>
        </div>
      </dl>

      {hasDetail ? (
        <>
          <div className="matrix-grid matrix-grid--wide">
            <MatrixTable
              title="State setelah XOR (sebelum AddRoundKey awal)"
              matrix={block.initialState.matrix}
            />
            <MatrixTable title="AddRoundKey ronde 0" matrix={block.addRoundKey.matrix} />
          </div>

          <Disclosure summary="Ronde 1 lengkap" open>
            <div className="matrix-grid">
              <MatrixTable title="SubBytes" matrix={block.round1.subBytes.matrix} />
              <MatrixTable title="ShiftRows" matrix={block.round1.shiftRows.matrix} />
              <MatrixTable title="MixColumns" matrix={block.round1.mixColumns.matrix} />
              <MatrixTable title="AddRoundKey" matrix={block.round1.addRoundKey.matrix} />
            </div>
          </Disclosure>

          <Disclosure summary="Ronde 2–9 — state akhir tiap ronde">
            <div className="matrix-grid">
              {block.rounds2to9.map((round) => (
                <MatrixTable key={round.round} title={`Ronde ${round.round}`} matrix={round.matrix} />
              ))}
            </div>
          </Disclosure>

          <Disclosure summary="Ronde 10 — tanpa MixColumns">
            <div className="matrix-grid">
              <MatrixTable title="SubBytes" matrix={block.round10.subBytes.matrix} />
              <MatrixTable title="ShiftRows" matrix={block.round10.shiftRows.matrix} />
              <MatrixTable title="AddRoundKey" matrix={block.round10.addRoundKey.matrix} />
            </div>
          </Disclosure>
        </>
      ) : (
        <p className="callout callout--muted">
          Blok lanjutan memakai ciphertext blok sebelumnya sebagai nilai XOR (CBC), lalu dienkripsi
          dengan round key yang sama.
        </p>
      )}

      <div className="hex-panel hex-panel--compact">
        <span className="hex-panel__label">Ciphertext blok</span>
        <code>{block.ciphertextHex}</code>
      </div>
    </article>
  );
}

export default function SimulasiResult({ result }) {
  const { steps } = result;
  const isMatch = steps.matching.status === 'Cocok';

  const byteRows = steps.textToBytes.bytes.map((byte) => [
    <code key="char">{byte.char}</code>,
    byte.ascii,
    <HexInline key="hex" value={byte.hex} />,
  ]);

  const letterRows = steps.byteToLetters.nibbles.map((item, index) => [
    <HexInline key="byte" value={item.byteHex} />,
    item.high,
    <strong key="high">{item.highLetter}</strong>,
    item.low,
    <strong key="low">{item.lowLetter}</strong>,
  ]);

  const pairRows = steps.playfairPairs.pairs.map((pair) => [
    pair.index,
    <code key="pair">{pair.input}</code>,
    pair.inserted ? <span key="yes" className="tag tag--accent">{pair.insertReason}</span> : '—',
  ]);

  const playfairRows = steps.playfairEncrypt.pairs.map((pair) => [
    pair.index,
    <code key="input">{pair.input}</code>,
    `(${pair.aPos.row + 1}, ${pair.aPos.col + 1})`,
    `(${pair.bPos.row + 1}, ${pair.bPos.col + 1})`,
    pair.rule,
    <code key="out">{pair.output}</code>,
  ]);

  const decryptionRows = steps.decryption.aes.blocks.map((block) => [
    block.index,
    <HexInline key="prev" value={block.prevHex} />,
    <HexInline key="dec" value={block.decryptedHex} />,
    <HexInline key="plain" value={block.plaintextHex} />,
  ]);

  const decryptPairRows = steps.decryption.playfair.pairs.map((pair) => [
    pair.index,
    <code key="input">{pair.input}</code>,
    <code key="out">{pair.output}</code>,
    pair.rule,
  ]);

  const roundKeyRows = steps.aes.roundKeyExpansion.map((roundKey) => [
    roundKey.round,
    <HexInline key="hex" value={roundKey.hex} />,
  ]);

  return (
    <div className="result">
      <div className={`verify-banner ${isMatch ? 'is-ok' : 'is-bad'}`} role="status">
        <span className="verify-banner__icon">
          <Icon name={isMatch ? 'check' : 'x'} size={22} />
        </span>
        <div className="verify-banner__copy">
          <p className="verify-banner__kicker">Pencocokan modul kripto</p>
          <h2>{isMatch ? 'Jejak manual terverifikasi' : 'Perlu diperiksa kembali'}</h2>
          <p>
            {isMatch
              ? 'Hasil Playfair, AES edukasi, dan node:crypto menghasilkan nilai yang sama.'
              : 'Ada pemeriksaan yang tidak cocok. Periksa parameter dan jejak langkah di bawah.'}
          </p>
        </div>
        <span className="verify-banner__pill">{steps.matching.status}</span>
      </div>

      <Pipeline steps={steps} ciphertextHex={result.ciphertextHex} />

      <StepCard
        number="1"
        title="Teks ke byte"
        description="Setiap karakter diubah menjadi kode ASCII dalam bentuk heksadesimal."
        index={0}
      >
        <Table
          caption="Konversi teks ke byte ASCII"
          columns={['Karakter', 'ASCII', 'Heksadesimal']}
          rows={byteRows}
        />
      </StepCard>

      <StepCard
        number="2"
        title="Byte ke huruf"
        description="Satu byte dipecah menjadi dua nibble, lalu dipetakan ke 16 huruf codec."
        index={1}
      >
        <Table
          caption="Pemetaan nibble ke huruf"
          columns={['Byte', 'Nibble atas', 'Huruf', 'Nibble bawah', 'Huruf']}
          rows={letterRows}
        />
        <div className="callout">
          <span>Hasil codec</span>
          <strong>{steps.byteToLetters.letters}</strong>
          <small>{steps.byteToLetters.letters.length} huruf dari {steps.textToBytes.bytes.length} byte</small>
        </div>
      </StepCard>

      <StepCard
        number="3"
        title="Matriks Playfair 5×5"
        description="Kata kunci mengisi matriks lebih dulu, lalu sisa alfabet tanpa J."
        index={2}
      >
        <MatrixTable
          title={`Kata kunci: ${steps.playfairSquare.keyword}`}
          matrix={steps.playfairSquare.matrix}
          variant="playfair"
        />
        <Disclosure summary="Lihat proses pengisian matriks">
          <ol className="fill-list">
            {steps.playfairSquare.fillSteps.map((step, index) => (
              <li key={`${step.letter}-${index}`}>
                <span className="fill-list__index">{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.letter}</strong>
                <span>{step.source}</span>
                <small>
                  {step.placed
                    ? `baris ${step.position.row + 1}, kolom ${step.position.col + 1}`
                    : step.note}
                </small>
              </li>
            ))}
          </ol>
        </Disclosure>
      </StepCard>

      <StepCard
        number="4"
        title="Pemecahan pasangan"
        description="Huruf kembar disisipi X, dan huruf ganjil di akhir mendapat X."
        index={3}
      >
        <Table caption="Daftar pasangan huruf" columns={['No', 'Pasangan', 'Sisipan X']} rows={pairRows} />
        <div className="metric-row">
          <div className="metric">
            <span>Huruf ganjil</span>
            <strong>{steps.playfairPairs.padding.isOdd ? 'Ya' : 'Tidak'}</strong>
          </div>
          <div className="metric">
            <span>Sisipan X</span>
            <strong>{steps.playfairPairs.padding.inserted}</strong>
          </div>
          <div className="metric">
            <span>Total pasangan</span>
            <strong>{steps.playfairPairs.pairs.length}</strong>
          </div>
        </div>
      </StepCard>

      <StepCard
        number="5"
        title="Enkripsi per pasangan"
        description="Aturan baris, kolom, dan persegi panjang diterapkan pada setiap pasangan."
        index={4}
      >
        <Table
          caption="Enkripsi Playfair per pasangan"
          columns={['No', 'Masukan', 'Posisi 1', 'Posisi 2', 'Aturan', 'Hasil']}
          rows={playfairRows}
        />
        <div className="callout callout--dark">
          <span>Ciphertext Playfair</span>
          <strong>{steps.playfairEncrypt.output}</strong>
          <small>Huruf diperlakukan sebagai byte ASCII pada lapis berikutnya</small>
        </div>
      </StepCard>

      <StepCard
        number="6"
        title="Masukan AES"
        description="Hasil Playfair diubah menjadi byte ASCII, lalu ditambah padding PKCS#7."
        index={5}
      >
        <div className="callout">
          <span>Teks Playfair</span>
          <strong>{steps.aesInput.text}</strong>
          <small>{steps.aesInput.text.length} karakter · menjadi {steps.aesInput.text.length} byte ASCII</small>
        </div>
        <div className="hex-stack">
          <div className="hex-panel">
            <span className="hex-panel__label">Teks Playfair → ASCII</span>
            <code>{steps.aesInput.asciiHex}</code>
          </div>
          <div className="hex-panel">
            <span className="hex-panel__label">
              Setelah padding ({steps.aesInput.paddingLength} byte bernilai {steps.aesInput.padValueHex})
            </span>
            <code>{steps.aesInput.paddedHex}</code>
          </div>
        </div>
      </StepCard>

      <StepCard
        number="7"
        title="AES-128-CBC"
        description="Ekspansi kunci, AddRoundKey awal, ronde penuh, lalu chaining antarblok."
        index={6}
      >
        <div className="detail-grid">
          <div>
            <dt>Kunci AES-128</dt>
            <dd>
              <HexInline value={steps.aes.keyHex} />
            </dd>
          </div>
          <div>
            <dt>Vektor inisialisasi (IV)</dt>
            <dd>
              <HexInline value={steps.aes.ivHex} />
            </dd>
          </div>
        </div>

        <div className="key-schedule">
          {steps.aes.roundKeyExpansion.slice(0, 2).map((roundKey) => (
            <div className="key-card" key={roundKey.round}>
              <span>Round key {roundKey.round}</span>
              <code>{roundKey.hex}</code>
            </div>
          ))}
        </div>

        <Disclosure summary="Semua round key (0–10)">
          <Table caption="Daftar round key" columns={['Ronde', 'Round key']} rows={roundKeyRows} />
        </Disclosure>

        {steps.aes.blocks.map((block) => (
          <AesBlockDetail key={block.index} block={block} />
        ))}

        <div className="hex-panel hex-panel--accent">
          <span className="hex-panel__label">Ciphertext lengkap</span>
          <code>{result.ciphertextHex}</code>
        </div>
      </StepCard>

      <StepCard
        number="8"
        title="Dekripsi"
        description="Urutan dibalik: AES-CBC, buang padding, Playfair balik, buang X, lalu decode byte."
        index={7}
      >
        <h4 className="subheading">Dekripsi AES per blok</h4>
        <Table
          caption="Dekripsi AES per blok"
          columns={['Blok', 'XOR (IV/ciphertext sebelumnya)', 'Hasil dekripsi', 'Plaintext']}
          rows={decryptionRows}
        />

        <div className="hex-stack">
          <div className="hex-panel">
            <span className="hex-panel__label">
              Hasil AES sebelum padding dibuang ({steps.decryption.aes.paddingLength} byte padding)
            </span>
            <code>{steps.decryption.aes.plaintextHex}</code>
          </div>
          <div className="hex-panel">
            <span className="hex-panel__label">Ciphertext Playfair</span>
            <code>{steps.decryption.aes.playfairCiphertext}</code>
          </div>
        </div>

        <h4 className="subheading">Dekripsi Playfair per pasangan</h4>
        <Table
          caption="Dekripsi Playfair per pasangan"
          columns={['No', 'Pasangan', 'Hasil', 'Aturan']}
          rows={decryptPairRows}
        />

        <div className="decode-chain">
          <div className="decode-chain__item">
            <span>Setelah X dibuang</span>
            <strong>{steps.decryption.playfair.stripped}</strong>
          </div>
          <span className="decode-chain__arrow" aria-hidden="true">
            <Icon name="arrowRight" size={16} />
          </span>
          <div className="decode-chain__item">
            <span>Byte</span>
            <code>{steps.decryption.bytesHex}</code>
          </div>
          <span className="decode-chain__arrow" aria-hidden="true">
            <Icon name="arrowRight" size={16} />
          </span>
          <div className="decode-chain__item decode-chain__item--final">
            <span>Teks awal</span>
            <strong>{steps.decryption.text}</strong>
          </div>
        </div>
      </StepCard>

      <StepCard
        number="9"
        title="Pencocokan dengan modul asli"
        description="Hasil simulasi dibandingkan dengan playfair.js dan AES dari node:crypto."
        index={8}
      >
        <ul className="check-list">
          {steps.matching.checks.map((check) => (
            <li className={check.cocok ? 'is-ok' : 'is-bad'} key={check.nama}>
              <span className="check-list__icon">
                <Icon name={check.cocok ? 'check' : 'x'} size={16} />
              </span>
              <span>{check.nama}</span>
              <strong>{check.cocok ? 'Cocok' : 'Tidak cocok'}</strong>
            </li>
          ))}
        </ul>

        <Disclosure summary="Ciphertext referensi node:crypto">
          <div className="hex-panel">
            <code>{steps.matching.referenceCiphertextHex}</code>
          </div>
        </Disclosure>
      </StepCard>
    </div>
  );
}
