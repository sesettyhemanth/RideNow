import React, { useEffect, useState } from 'react';
import api from '../api.js';

function SecureImage({ src, alt, className }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let currentUrl = null;
    setFailed(false);

    api
      .get(src, { responseType: 'blob' })
      .then((res) => {
        currentUrl = URL.createObjectURL(res.data);
        setObjectUrl(currentUrl);
      })
      .catch(() => setFailed(true));

    return () => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
    };
  }, [src]);

  if (failed) return null;
  if (!objectUrl) return <p className="secure-image-loading">Loading image...</p>;

  return <img src={objectUrl} alt={alt} className={className} />;
}

export default SecureImage;
