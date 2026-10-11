import { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Google only accepts widths between 200 and 400 px.
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

let scriptPromise;

/** Loads the Google Identity Services script once and shares the promise. */
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        scriptPromise = undefined; // allow a retry on the next mount
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

const clampWidth = (w) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.floor(w)));

function GoogleLoginButton({ onCredential }) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const [failed, setFailed] = useState(false);

  // always call the latest handler without re-initialising Google
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  // load the SDK and initialise it once
  useEffect(() => {
    let cancelled = false;

    if (!CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set');
      setFailed(true);
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => credential && callbackRef.current?.(credential),
        });
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
    };
  }, []);

  // keep the button as wide as its container (within Google's limits)
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const update = () => setWidth(clampWidth(node.getBoundingClientRect().width));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // (re)render the button whenever the SDK is ready or the width changes
  useEffect(() => {
    if (!ready || !width || !buttonRef.current) return;

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'left',
      width,
    });
  }, [ready, width]);

  if (failed) {
    return (
      <p className="error-text" role="alert">
        Google sign-in is unavailable right now.
      </p>
    );
  }

  return (
    <div ref={containerRef} className="google-btn-container">
      <div ref={buttonRef} className="google-btn" />
    </div>
  );
}

GoogleLoginButton.propTypes = {
  onCredential: PropTypes.func.isRequired,
};

export default memo(GoogleLoginButton);