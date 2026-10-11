import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api.js';

export const VEHICLE_TYPES = ['bike', 'scooter', 'car'];

export async function fetchVehicleCatalog() {
  const results = await Promise.all(VEHICLE_TYPES.map((type) => api.get(`/vehicles/${type}`)));
  return results.flatMap((res, i) => (res.data.data || []).map((v) => ({ ...v, type: VEHICLE_TYPES[i] })));
}

export function useVehicleCatalog() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setVehicles(await fetchVehicleCatalog());
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load vehicles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { vehicles, loading, error, reload };
}

// The top-bar search box navigates to <page>?q=term - pages read it with this hook.
export function useUrlSearch() {
  const [params] = useSearchParams();
  return params.get('q') || '';
}

export function usePagedList(items, pageSize, resetDeps = []) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const startIdx = (current - 1) * pageSize;

  return {
    rows: items.slice(startIdx, startIdx + pageSize),
    page: current,
    pageCount,
    total,
    start: total ? startIdx + 1 : 0,
    end: Math.min(startIdx + pageSize, total),
    offset: startIdx,
    setPage,
  };
}

export function useOutsideClick(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handler(event);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, handler, active]);
}
