import Icon from './Icon.jsx';

export default function PageHero({ eyebrow, title, description, chips = [], children }) {
  return (
    <section className="page-hero">
      <div className="page-hero__pattern" aria-hidden="true" />
      <div className="page-hero__glow" aria-hidden="true" />
      <div className="page-hero__content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero__description">{description}</p>
        {children}
      </div>
      {chips.length ? (
        <dl className="hero-chips">
          {chips.map((chip) => (
            <div className="hero-chip" key={chip.label}>
              <span className="hero-chip__icon">
                <Icon name={chip.icon} size={18} />
              </span>
              <div>
                <dt>{chip.label}</dt>
                <dd>{chip.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
