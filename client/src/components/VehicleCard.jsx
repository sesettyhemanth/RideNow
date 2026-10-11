import React from 'react';
import { Link } from 'react-router-dom';
import { vehicleImageUrl, vehicleImageCount } from '../utils/vehicleImage.js';
import '../styles/VehicleCard.css';

function VehicleCard({ vehicle, isFavorite, onToggleFavorite }) {
  const typeBadge = {
    bike: { label: 'Bike', color: '#2354e6' },
    scooter: { label: 'Scooter', color: '#22c55e' },
    car: { label: 'Car', color: '#e6a300' },
  }[vehicle.type];

  const hasPhoto = vehicleImageCount(vehicle) > 0;

  return (
    <div className="vehicle-card card">
      <div className="vehicle-card-image">
        <span className="vehicle-badge" style={{ backgroundColor: typeBadge.color }}>
          {typeBadge.label}
        </span>

        {onToggleFavorite && (
          <button
            className={`favorite-toggle ${isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(vehicle.id, isFavorite)}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}

        {hasPhoto ? (
          <img src={vehicleImageUrl(vehicle)} alt={vehicle.name} />
        ) : (
          <div className="vehicle-card-placeholder">📷 No photo yet</div>
        )}
      </div>

      <div className="vehicle-card-body">
        <div className="vehicle-card-top">
          <h3>{vehicle.name}</h3>
          <span className="vehicle-rating">★ {vehicle.rating}</span>
        </div>
        <p className="vehicle-trips">{vehicle.trips} trips</p>

        <p className="vehicle-price">
          ₹{vehicle.pricePerDay} <span>/ day</span>
        </p>

        <div className="vehicle-specs">
          <span>{vehicle.cc}</span>
          <span>{vehicle.mileage}</span>
          <span>{vehicle.transmission}</span>
          <span>{vehicle.seats} Seater</span>
        </div>

        <Link to={`/vehicles/${vehicle.type}/${vehicle.id}`} className="btn btn-outline btn-block">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default VehicleCard;
