import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api.js';
import { vehicleImageUrl, vehicleImageCount } from '../utils/vehicleImage.js';
import '../styles/VehicleDetails.css';

function Icon({ size = 18, strokeWidth = 1.8, children }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {children}
    </svg>
  );
}

const ArrowLeft = () => (
  <Icon size={18} strokeWidth={2.2}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </Icon>
);
const ChevronL = () => (
  <Icon size={18} strokeWidth={2.4}>
    <path d="m15 6-6 6 6 6" />
  </Icon>
);
const ChevronR = () => (
  <Icon size={18} strokeWidth={2.4}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
const BikeIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <circle cx="15" cy="5" r="1" />
    <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
  </Icon>
);
const ScooterIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <circle cx="5" cy="19" r="2" />
    <circle cx="19" cy="19" r="2" />
    <path d="M7 19h10" />
    <path d="M17 19 14.5 4H12" />
  </Icon>
);
const CarIcon = ({ size = 14 }) => (
  <Icon size={size}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </Icon>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#FBBF24" aria-hidden="true" style={{ display: 'block' }}>
    <path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" />
  </svg>
);
const EngineIcon = () => (
  <Icon size={22}>
    <path d="M4 9h3l2-2h6l2 2h3v7h-3l-2 2H9l-2-2H4z" />
    <path d="M2 12v3" />
  </Icon>
);
const MileageIcon = () => (
  <Icon size={22}>
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="m12 17 4-5" />
  </Icon>
);
const GearIcon = () => (
  <Icon size={22}>
    <path d="M6 4v8" />
    <path d="M12 4v16" />
    <path d="M18 4v8" />
    <path d="M6 12h12" />
  </Icon>
);
const SeatIcon = () => (
  <Icon size={22}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
  </Icon>
);
const PinIcon = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);
const CalendarIcon = () => (
  <Icon size={22} strokeWidth={2}>
    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M8 14h2" />
    <path d="M14 14h2" />
  </Icon>
);

/* Feature icons (picked by keyword, with a generic fallback) */
const FuelFeature = () => (
  <Icon size={20}>
    <path d="M6 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
    <path d="M4 20h13" />
    <path d="M15 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3" />
    <path d="M9 8h3" />
  </Icon>
);
const ShieldFeature = () => (
  <Icon size={20}>
    <path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </Icon>
);
const HelmetFeature = () => (
  <Icon size={20}>
    <path d="M4 15a8 8 0 0 1 16 0v3H8a4 4 0 0 1-4-3Z" />
    <path d="M12 7v4h8" />
  </Icon>
);
const SupportFeature = () => (
  <Icon size={20}>
    <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
    <rect x="3" y="13" width="4" height="6" rx="1.5" />
    <rect x="17" y="13" width="4" height="6" rx="1.5" />
    <path d="M19 19c0 1.5-2 2-5 2" />
  </Icon>
);

function featureIcon(name = '') {
  const n = name.toLowerCase();
  if (n.includes('fuel')) return <FuelFeature />;
  if (n.includes('helmet')) return <HelmetFeature />;
  if (n.includes('support') || n.includes('24')) return <SupportFeature />;
  return <ShieldFeature />; // well maintained, insurance, etc.
}

const TYPE_LABELS = { bike: 'Bike', scooter: 'Scooter', car: 'Car' };
const TYPE_ICONS = { bike: BikeIcon, scooter: ScooterIcon, car: CarIcon };

function VehicleDetails() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const thumbsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Cream page background on <body> while this page is mounted.
  useEffect(() => {
    document.body.classList.add('vehicle-details-bg');
    return () => document.body.classList.remove('vehicle-details-bg');
  }, []);

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/vehicles/${type}/${id}`);
      setVehicle(res.data.data);
      setActiveImage(0);
    } catch (err) {
      setError('Vehicle not found.');
    } finally {
      setLoading(false);
    }
  };

  // Show/hide the thumbnail arrows depending on how far the strip can scroll.
  const updateScrollArrows = () => {
    const el = thumbsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollArrows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  const scrollThumbs = (direction) => {
    thumbsRef.current?.scrollBy({ left: direction * 180, behavior: 'smooth' });
  };

  if (loading) return <p className="container vehicle-details-status">Loading...</p>;
  if (error || !vehicle) {
    return <p className="container vehicle-details-status error-text">{error || 'Vehicle not found.'}</p>;
  }

  const imageCount = vehicleImageCount(vehicle);
  const showPrevNext = imageCount > 1;
  const vehicleType = vehicle.type || type;
  const TypeIcon = TYPE_ICONS[vehicleType] || BikeIcon;
  const typeLabel = TYPE_LABELS[vehicleType] || vehicleType;
  const features = vehicle.features || [];

  const goToImage = (index) => {
    setActiveImage((index + imageCount) % imageCount);
  };

  const openMap = () => {
    const q = encodeURIComponent(vehicle.location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
  };

  const specs = [
    { Icon: EngineIcon, value: vehicle.cc, label: 'Engine Capacity' },
    { Icon: MileageIcon, value: vehicle.mileage, label: 'Mileage' },
    { Icon: GearIcon, value: vehicle.transmission, label: 'Transmission' },
    { Icon: SeatIcon, value: vehicle.seats ? `${vehicle.seats} Seater` : '', label: 'Seating Capacity' },
  ];

  return (
    <div className="vehicle-details-page">
      <section className="vehicle-details container">
        <Link to="/vehicles" className="back-link">
          <ArrowLeft />
          Back to vehicles
        </Link>

        <div className="vehicle-details-layout">
          <div className="vehicle-gallery">
            <div className="vehicle-gallery-main">
              <span className="type-badge type-badge--overlay">
                <TypeIcon size={14} />
                {typeLabel}
              </span>

              {imageCount === 0 ? (
                <div className="vehicle-gallery-placeholder">📷 No photos yet</div>
              ) : (
                <img src={vehicleImageUrl(vehicle, activeImage)} alt={`${vehicle.name} - view ${activeImage + 1}`} />
              )}

              {showPrevNext && (
                <>
                  <button
                    type="button"
                    className="gallery-nav gallery-prev"
                    aria-label="Previous photo"
                    onClick={() => goToImage(activeImage - 1)}
                  >
                    <ChevronL />
                  </button>
                  <button
                    type="button"
                    className="gallery-nav gallery-next"
                    aria-label="Next photo"
                    onClick={() => goToImage(activeImage + 1)}
                  >
                    <ChevronR />
                  </button>
                </>
              )}
            </div>

            {imageCount > 1 && (
              <div className="vehicle-gallery-thumbs-wrap">
                {canScrollLeft && (
                  <button
                    type="button"
                    className="thumb-scroll-btn thumb-scroll-left"
                    aria-label="Scroll thumbnails left"
                    onClick={() => scrollThumbs(-1)}
                  >
                    <ChevronL />
                  </button>
                )}

                <div className="vehicle-gallery-thumbs" ref={thumbsRef} onScroll={updateScrollArrows}>
                  {Array.from({ length: imageCount }).map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`gallery-thumb ${index === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show photo ${index + 1}`}
                    >
                      <img src={vehicleImageUrl(vehicle, index)} alt={`${vehicle.name} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>

                {canScrollRight && (
                  <button
                    type="button"
                    className="thumb-scroll-btn thumb-scroll-right"
                    aria-label="Scroll thumbnails right"
                    onClick={() => scrollThumbs(1)}
                  >
                    <ChevronR />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="vehicle-info">
            <div className="vehicle-info-head">
              <div className="vehicle-info-title">
                <span className="type-badge">
                  <TypeIcon size={14} />
                  {typeLabel}
                </span>
                <h1>{vehicle.name}</h1>
                <p className="vehicle-rating">
                  <StarIcon />
                  <strong>{vehicle.rating}</strong>
                  <span>({vehicle.trips} Reviews)</span>
                </p>
              </div>

              <p className="vehicle-price-large">
                ₹{vehicle.pricePerDay}
                <span> /day</span>
              </p>
            </div>

            <div className="vehicle-quick-specs">
              {specs.map(({ Icon: SpecIcon, value, label }) => (
                <div key={label} className="spec-item">
                  <SpecIcon />
                  <div className="spec-text">
                    <strong>{value}</strong>
                    <small>{label}</small>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="info-heading">About Vehicle</h3>
            <p className="vehicle-about">{vehicle.about}</p>

            <div className="vehicle-location">
              <div className="vehicle-location-text">
                <PinIcon size={20} />
                <div>
                  <h3 className="info-heading">Location</h3>
                  <p>{vehicle.location}</p>
                </div>
              </div>
              <button type="button" className="view-map-link" onClick={openMap}>
                <PinIcon size={14} />
                View on map
              </button>
            </div>

            {features.length > 0 && (
              <>
                <h3 className="info-heading features-heading">Features</h3>
                <div className="vehicle-features-grid">
                  {features.map((feature) => (
                    <div key={feature} className="feature-chip">
                      <span className="feature-icon">{featureIcon(feature)}</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="button"
              className="book-now-btn"
              onClick={() => navigate(`/booking/${type}/${id}`)}
            >
              <CalendarIcon />
              Book Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default VehicleDetails;