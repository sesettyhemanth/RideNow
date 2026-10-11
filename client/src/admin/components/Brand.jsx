import React from 'react';
import logo from '../../assets/logo.png';    
import sidebarImage from '../../assets/admin.png';  

export function BrandMark({ size = 40 }) {
  return (
    <img
      src={logo}
      alt="RideNow logo"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, objectFit: 'contain', borderRadius: '50%', flex: 'none' }}
    />
  );
}

export function SidebarArt() {
  return (
    <div className="admin-sidebar-art">
      <img
        src={sidebarImage}
        alt=""
        aria-hidden="true"
        style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 12, marginBottom: 14 }}
      />
      <p>
        Ride More
        <br />
        Worry Less
      </p>
      <span className="admin-sidebar-art__rule" />
    </div>
  );
}