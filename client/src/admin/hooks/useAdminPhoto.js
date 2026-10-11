import { useEffect, useState } from 'react';
import api from '../../api.js';

let cached = { key: '', promise: null };

function loadPhoto(key) {
  if (cached.key !== key) {
    const promise = api.get('/admin/profile-image', { responseType: 'blob' }).then((res) => {
      if (!res.data || !String(res.data.type).startsWith('image/')) {
        throw new Error(`The server did not send an image (got "${res.data?.type || 'nothing'}")`);
      }
      return URL.createObjectURL(res.data);
    });
    cached = { key, promise };
    promise.catch((err) => {
      console.error('Could not load the admin profile photo:', err.response?.status || '', err.message);
      if (cached.promise === promise) cached = { key: '', promise: null };
    });
  }
  return cached.promise;
}

export function useAdminPhoto(admin) {
  const [url, setUrl] = useState('');
  const has = Boolean(admin?.hasProfileImage);
  const key = `${admin?.id || admin?.email || 'admin'}:${admin?.imageVersion || 0}`;

  useEffect(() => {
    if (!has) {
      setUrl('');
      return undefined;
    }

    let cancelled = false;
    loadPhoto(key)
      .then((objectUrl) => {
        if (!cancelled) setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [has, key]);

  return has ? url : '';
}