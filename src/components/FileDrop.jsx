import { useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { formatBytes } from '../lib/files.js';

export default function FileDrop({ file, onFile, accept, hint, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const pick = (files) => {
    const next = files?.[0] ?? null;
    onFile(next);
  };

  return (
    <div
      className={`file-drop ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) pick(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        id={inputId}
        className="file-drop__input"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          pick(event.target.files);
          event.target.value = '';
        }}
      />

      {file ? (
        <div className="file-drop__selected">
          <span className="file-drop__icon">
            <Icon name="file" size={24} />
          </span>
          <div className="file-drop__details">
            <strong>{file.name}</strong>
            <span>
              {formatBytes(file.size)} · {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => {
              onFile(null);
              inputRef.current?.focus();
            }}
            aria-label={`Hapus ${file.name}`}
            disabled={disabled}
          >
            <Icon name="trash" size={18} />
          </button>
        </div>
      ) : (
        <label className="file-drop__empty" htmlFor={inputId}>
          <span className="file-drop__badge">
            <Icon name="upload" size={22} />
          </span>
          <strong>Letakkan berkas di sini</strong>
          <span>atau klik untuk memilih dari perangkat</span>
          {hint ? <small>{hint}</small> : null}
        </label>
      )}
    </div>
  );
}
