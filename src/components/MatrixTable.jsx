export default function MatrixTable({ title, matrix, variant = 'state', caption }) {
  if (!matrix) return null;
  const width = matrix[0]?.length ?? 0;
  const label = caption || title || 'Matriks';
  return (
    <figure className={`matrix matrix--${variant}`}>
      {title ? <figcaption className="matrix__title">{title}</figcaption> : null}
      <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
        <table className="matrix-table">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <th scope="col" className="matrix-table__corner" aria-hidden="true" />
              {Array.from({ length: width }, (_, index) => (
                <th key={index} scope="col">
                  {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th scope="row">{rowIndex + 1}</th>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <code>{cell}</code>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
