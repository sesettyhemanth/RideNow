import React from 'react';
import Icon from './Icon.jsx';

function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="ad-page-header">
      <div>
        <h1>
          {icon && <Icon name={icon} size={30} strokeWidth={1.8} />}
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="ad-page-header__actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
