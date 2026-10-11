import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api.js';
import { useApp } from '../context/AppContext.jsx';
import { vehicleImageUrl, vehicleImageCount } from '../utils/vehicleImage.js';
import HERO_IMAGE from '../assets/hero.png';
import FALLBACK_IMAGE from '../assets/vehicle.png';
import '../styles/Vehicles.css';

const PAGE_SIZE = 12;
const PRICE_MIN = 200;
const PRICE_MAX = 5000;
const PRICE_STEP = 100;


const TYPE_LABELS = {
  bike: 'Bike',
  scooter: 'Scooter',
  car: 'Car',
};

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Sort by: Popularity' },
  { value: 'priceLow', label: 'Price: Low to High' },
  { value: 'priceHigh', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

// `popularity` keeps the order returned by the API.
const SORTERS = {
  priceLow: (a, b) => a.pricePerDay - b.pricePerDay,
  priceHigh: (a, b) => b.pricePerDay - a.pricePerDay,
  rating: (a, b) => b.rating - a.rating,
};

const priceFormatter = new Intl.NumberFormat('en-IN');

function Svg({ size = 18, strokeWidth = 1.8, filled = false, color, children }) {
  return (
    <svg
      className="veh-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  );
}

function BikeIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <circle cx="15" cy="5" r="1" />
      <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </Svg>
  );
}

function ScooterIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M7 19h10" />
      <path d="M17 19 14.5 4H12" />
      <path d="M14.5 4H17" />
    </Svg>
  );
}

function CarIcon({ size = 18 }) {
  return (
    <Svg size={size}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </Svg>
  );
}

function FuelIcon({ size = 14 }) {
  return (
    <Svg size={size} filled color="#F59E0B">
      <path d="M12 2s5.5 4.6 5.5 10a5.5 5.5 0 0 1-11 0c0-2 .9-3.4 1.9-4.5.2 1.5 1 2.3 1.8 2.6C10 7.4 11 4.2 12 2Z" />
    </Svg>
  );
}

function TransmissionIcon({ size = 14 }) {
  return (
    <Svg size={size}>
      <path d="M6 5v14" />
      <path d="M12 5v14" />
      <path d="M18 5v6a2 2 0 0 1-2 2h-4" />
      <circle cx="6" cy="4.5" r="1.4" />
      <circle cx="12" cy="4.5" r="1.4" />
      <circle cx="18" cy="4.5" r="1.4" />
    </Svg>
  );
}

function HeartIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <path d="M12 20.5s-7.8-4.7-9.6-9.4C1.2 7.9 3 4.8 6.4 4.8c2 0 3.5 1 5.6 3.1 2.1-2.1 3.6-3.1 5.6-3.1 3.4 0 5.2 3.1 4 6.3-1.8 4.7-9.6 9.4-9.6 9.4Z" />
    </Svg>
  );
}

function ArrowRightIcon({ size = 14 }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

function ChevronDownIcon({ size = 14 }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

function GridIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </Svg>
  );
}

function ListIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </Svg>
  );
}

function SlidersIcon({ size = 16 }) {
  return (
    <Svg size={size}>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <path d="M14 4v6" />
      <path d="M6 14v6" />
    </Svg>
  );
}

function CloseIcon({ size = 12 }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </Svg>
  );
}

const TYPE_TABS = [
  { value: 'all', label: 'All Vehicles', Icon: BikeIcon },
  { value: 'bike', label: 'Bikes', Icon: BikeIcon },
  { value: 'scooter', label: 'Scooters', Icon: ScooterIcon },
  { value: 'car', label: 'Cars', Icon: CarIcon },
];

const VehicleCard = memo(function VehicleCard({ vehicle, isFavorite, onToggleFavorite }) {
  const { id, name, type, pricePerDay, transmission } = vehicle;
  const fuel = vehicle.fuelType ?? vehicle.fuel;
  // same helper the details page uses, so both pages show the same photo
  const imageSrc = vehicleImageCount(vehicle) > 0 ? vehicleImageUrl(vehicle, 0) : FALLBACK_IMAGE;

  const handleFavoriteClick = useCallback(() => {
    onToggleFavorite(id, isFavorite);
  }, [id, isFavorite, onToggleFavorite]);

  const handleImageError = useCallback((event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = '1';
    img.src = FALLBACK_IMAGE;
  }, []);

  return (
    <article className="vehicle-card">
      <div className="vehicle-card__media">
        <span className={`vehicle-card__badge vehicle-card__badge--${type}`}>
          {TYPE_LABELS[type] ?? type}
        </span>

        <button
          type="button"
          className={`vehicle-card__fav${isFavorite ? ' is-active' : ''}`}
          onClick={handleFavoriteClick}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
        >
          <HeartIcon size={16} />
        </button>

        <img
          className="vehicle-card__image"
          src={imageSrc}
          alt={name}
          width="320"
          height="200"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
      </div>

      <div className="vehicle-card__body">
        <h3 className="vehicle-card__name">{name}</h3>

        <ul className="vehicle-card__specs">
          {fuel && (
            <li>
              <FuelIcon size={14} />
              <span>{fuel}</span>
            </li>
          )}
          {transmission && (
            <li>
              <TransmissionIcon size={14} />
              <span>{transmission}</span>
            </li>
          )}
        </ul>

        <p className="vehicle-card__price">
          <strong>₹{priceFormatter.format(pricePerDay)}</strong>
          <span>/day</span>
        </p>

        <Link className="vehicle-card__cta" to={`/vehicles/${type}/${id}`}>
          View Details
          <ArrowRightIcon size={14} />
        </Link>
      </div>
    </article>
  );
});

function Vehicles() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [maxPrice, setMaxPrice] = useState(PRICE_MAX);
  const [transmission, setTransmission] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // The URL is the single source of truth for type + search.
  const typeFilter = searchParams.get('type') || 'all';
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/vehicles');
        if (!cancelled) setVehicles(res.data.data);
      } catch {
        if (!cancelled) {
          setError('Could not load vehicles. Please make sure the backend server is running.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/users/me/favorites');
      setFavoriteIds(new Set(res.data.data.map((v) => v.id)));
    } catch {
      // Favorites are a nice-to-have; don't fail the whole page over them.
    }
  }, []);

  useEffect(() => {
    if (user) fetchFavorites();
    else setFavoriteIds(new Set());
  }, [user, fetchFavorites]);

  const toggleFavorite = useCallback(
    async (vehicleId, isCurrentlyFavorite) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Optimistic update, reconciled with the server on failure.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) next.delete(vehicleId);
        else next.add(vehicleId);
        return next;
      });

      try {
        const url = `/users/me/favorites/${vehicleId}`;
        await (isCurrentlyFavorite ? api.delete(url) : api.put(url));
      } catch {
        fetchFavorites();
      }
    },
    [user, navigate, fetchFavorites]
  );

  const filtered = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const result = vehicles.filter(
      (v) =>
        (typeFilter === 'all' || v.type === typeFilter) &&
        v.pricePerDay <= maxPrice &&
        (transmission === 'all' || v.transmission?.toLowerCase() === transmission) &&
        (!query || v.name.toLowerCase().includes(query))
    );

    const sorter = SORTERS[sortBy];
    return sorter ? [...result].sort(sorter) : result;
  }, [vehicles, typeFilter, maxPrice, transmission, searchTerm, sortBy]);

  // Return to page 1 whenever the result set changes shape.
  useEffect(() => {
    setPage(1);
  }, [typeFilter, maxPrice, transmission, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(pageStart, pageStart + PAGE_SIZE);

  const updateParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (!value || value === 'all') next.delete(key);
        else next.set(key, value);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const clearFilters = () => {
    setMaxPrice(PRICE_MAX);
    setTransmission('all');
    updateParams({ type: 'all' });
  };

  const isEmpty = !loading && !error && filtered.length === 0;
  const rangeLabel = filtered.length ? `${pageStart + 1} – ${pageStart + visible.length}` : '0';

  return (
    <main className="vehicles-page">
      <header className="vehicles-hero">
        <div className="vehicles-hero__inner">
          <div className="vehicles-hero__copy">
            <h1 className="vehicles-hero__title">
              Explore <span>Our Vehicles</span>
            </h1>
            <p className="vehicles-hero__subtitle">
              Choose from a wide range of bikes, cars and scooters for your next ride.
            </p>

            {searchTerm && (
              <p className="search-pill">
                Showing results for “<strong>{searchTerm}</strong>”
                <button
                  type="button"
                  onClick={() => updateParams({ search: '' })}
                  aria-label="Clear search"
                >
                  <CloseIcon size={12} />
                </button>
              </p>
            )}

            <nav className="type-tabs" aria-label="Vehicle type">
              {TYPE_TABS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  className={`type-tabs__item${typeFilter === value ? ' is-active' : ''}`}
                  aria-pressed={typeFilter === value}
                  onClick={() => updateParams({ type: value })}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <img
            className="vehicles-hero__art"
            src={HERO_IMAGE}
            alt=""
            aria-hidden="true"
            width="620"
            height="190"
            fetchPriority="high"
          />
        </div>
      </header>

      <section className="vehicles-content">
        <div className="vehicles-toolbar">
          <p className="vehicles-toolbar__count" aria-live="polite">
            Showing {rangeLabel} of {filtered.length} vehicles
          </p>

          <div className="vehicles-toolbar__controls">
            <button
              type="button"
              className={`toolbar-btn${showFilters ? ' is-open' : ''}`}
              aria-expanded={showFilters}
              aria-controls="vehicle-filters"
              onClick={() => setShowFilters((open) => !open)}
            >
              <SlidersIcon size={16} />
              Filters
            </button>

            <div className="select-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort vehicles"
              >
                {SORT_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon size={14} />
            </div>

            <div className="view-toggle" role="group" aria-label="Layout">
              <button
                type="button"
                className={viewMode === 'grid' ? 'is-active' : ''}
                aria-pressed={viewMode === 'grid'}
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon size={16} />
              </button>
              <button
                type="button"
                className={viewMode === 'list' ? 'is-active' : ''}
                aria-pressed={viewMode === 'list'}
                aria-label="List view"
                onClick={() => setViewMode('list')}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div id="vehicle-filters" className="filters-panel">
            <div className="filters-panel__group">
              <label htmlFor="filter-price">Max Price: ₹{maxPrice}/day</label>
              <input
                id="filter-price"
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>

            <div className="filters-panel__group">
              <label htmlFor="filter-transmission">Transmission</label>
              <select
                id="filter-transmission"
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
              >
                <option value="all">All</option>
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>

            <button type="button" className="filters-panel__clear" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        {loading && <p className="vehicles-status">Loading vehicles...</p>}
        {error && (
          <p className="vehicles-status vehicles-status--error" role="alert">
            {error}
          </p>
        )}
        {isEmpty && <p className="vehicles-status">No vehicles match your filters right now.</p>}

        <div className={`vehicles-grid vehicles-grid--${viewMode}`}>
          {visible.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isFavorite={favoriteIds.has(vehicle.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            <button
              type="button"
              className="pagination__arrow pagination__arrow--prev"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ArrowRightIcon size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={n === currentPage ? 'is-active' : ''}
                aria-current={n === currentPage ? 'page' : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              className="pagination__arrow"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ArrowRightIcon size={14} />
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

export default Vehicles;