import { useId, useState } from 'react';
import Icon from './Icon.jsx';

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  hint,
  autoComplete = 'new-password',
  disabled = false,
  name = 'password',
  required = true,
}) {
  const generatedId = useId();
  const inputId = id || `password-${generatedId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={inputId}>{label}</label>
      <div className="password-control">
        <input
          id={inputId}
          className="input input--password"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          name={name}
          autoComplete={autoComplete}
          aria-describedby={hintId}
          disabled={disabled}
          required={required}
        />
        <button
          className="password-toggle"
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={visible}
          disabled={disabled}
        >
          <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
        </button>
      </div>
      {hint ? (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
