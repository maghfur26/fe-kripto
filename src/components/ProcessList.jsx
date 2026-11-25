export default function ProcessList({ items }) {
  return (
    <ol className="process-list">
      {items.map((item, index) => (
        <li key={item.title}>
          <span className="process-list__index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
