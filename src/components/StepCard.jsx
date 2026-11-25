export default function StepCard({ number, title, description, children, index = 0 }) {
  return (
    <section className="step-card" style={{ '--step-index': index }} aria-labelledby={`step-title-${number}`}>
      <header className="step-card__header">
        <span className="step-card__number" aria-hidden="true">
          {number}
        </span>
        <div>
          <h3 id={`step-title-${number}`}>{title}</h3>
          {description ? <p className="step-card__description">{description}</p> : null}
        </div>
      </header>
      <div className="step-card__body">{children}</div>
    </section>
  );
}
