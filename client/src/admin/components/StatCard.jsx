import React from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

function StatCard({ tone = 'yellow', icon, label, value, footer, to }) {
  const content = (
    <>
      <span className="ad-stat__icon">
        <Icon name={icon} size={24} />
      </span>
      <div className="ad-stat__body">
        <span className="ad-stat__label">{label}</span>
        <strong className="ad-stat__value">{value}</strong>
        {footer && <div className="ad-stat__footer">{footer}</div>}
      </div>
      {to && <Icon name="chevronRight" size={16} className="ad-stat__chev" />}
    </>
  );

  return to ? (
    <Link to={to} className={`ad-stat ad-stat--${tone} ad-stat--link`}>
      {content}
    </Link>
  ) : (
    <div className={`ad-stat ad-stat--${tone}`}>{content}</div>
  );
}

// "↑ 8% from last week" - green when up, red when down, grey when flat.
export function Trend({ pct, label = 'from last week' }) {
  if (pct === null) {
    return (
      <span className="ad-trend ad-trend--up">
        <Icon name="arrowUp" size={12} strokeWidth={2.6} /> New this week
      </span>
    );
  }
  if (pct === 0) return <span className="ad-trend ad-trend--flat">0% {label}</span>;
  const up = pct > 0;
  return (
    <span className={`ad-trend ${up ? 'ad-trend--up' : 'ad-trend--down'}`}>
      <Icon name={up ? 'arrowUp' : 'arrowDown'} size={12} strokeWidth={2.6} /> {Math.abs(pct)}% {label}
    </span>
  );
}

// "↑ 2 new this week"
export function NewThisWeek({ count, noun = 'new' }) {
  return (
    <span className={`ad-trend ${count > 0 ? 'ad-trend--up' : 'ad-trend--flat'}`}>
      {count > 0 && <Icon name="arrowUp" size={12} strokeWidth={2.6} />} {count} {noun} this week
    </span>
  );
}

export default StatCard;
