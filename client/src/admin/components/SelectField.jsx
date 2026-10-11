import React from 'react';
import Icon from './Icon.jsx';

function SelectField({ value, onChange, children, icon, label, className = '' }) {
  return (
    <label className={`ad-select ${icon ? 'ad-select--icon' : ''} ${className}`.trim()}>
      {icon && <Icon name={icon} size={16} className="ad-select__lead" />}
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {children}
      </select>
      <Icon name="chevronDown" size={16} className="ad-select__chev" />
    </label>
  );
}

export default SelectField;
