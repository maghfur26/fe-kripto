import Icon from './Icon.jsx';

function shortValue(value, max = 18) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

export default function Pipeline({ steps, ciphertextHex }) {
  const stages = [
    {
      label: 'Byte',
      value: steps.textToBytes.hex.toUpperCase(),
      meta: `${steps.textToBytes.bytes.length} byte`,
    },
    {
      label: 'Huruf',
      value: steps.byteToLetters.letters,
      meta: `${steps.byteToLetters.letters.length} huruf`,
    },
    {
      label: 'Playfair',
      value: steps.playfairEncrypt.output,
      meta: 'Lapis 1',
    },
    {
      label: 'AES-128',
      value: steps.aesInput.paddedHex.toUpperCase(),
      meta: `${steps.aesInput.paddedHex.length / 2} byte`,
    },
    {
      label: 'Ciphertext',
      value: ciphertextHex.toUpperCase(),
      meta: `${ciphertextHex.length / 2} byte`,
    },
  ];

  return (
    <ol className="pipeline" aria-label="Alur transformasi data">
      {stages.map((stage, index) => (
        <li className="pipeline__stage" key={stage.label}>
          <span className="pipeline__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="pipeline__content">
            <span className="pipeline__label">{stage.label}</span>
            <code className="pipeline__value" title={stage.value}>
              {shortValue(stage.value)}
            </code>
            <span className="pipeline__meta">{stage.meta}</span>
          </div>
          {index < stages.length - 1 ? (
            <span className="pipeline__arrow" aria-hidden="true">
              <Icon name="arrowRight" size={16} />
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
