import React from 'react';
import { vehicleImageUrl, vehicleImageCount } from '../../utils/vehicleImage.js';
import Icon from './Icon.jsx';

function VehicleThumb({ vehicle, type, width = 52, height = 40, alt = '' }) {
  const hasPhoto = vehicle && vehicleImageCount(vehicle) > 0;
  const iconName = ['bike', 'scooter', 'car'].includes(String(type || vehicle?.type).toLowerCase())
    ? String(type || vehicle?.type).toLowerCase()
    : 'car';

  return (
    <span className="ad-thumb" style={{ width, height }}>
      {hasPhoto ? (
        <img src={vehicleImageUrl(vehicle)} alt={alt || vehicle.name} loading="lazy" />
      ) : (
        <Icon name={iconName} size={Math.round(height * 0.5)} />
      )}
    </span>
  );
}

export default VehicleThumb;
