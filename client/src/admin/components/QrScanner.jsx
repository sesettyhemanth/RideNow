import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import Icon from './Icon.jsx';
import '../styles/QrScanner.css';
import '../styles/AdminMobile.css';

const REGION_ID = 'admin-qr-region';

function QrScanner({ open, onClose, onScan }) {
  const [error, setError] = useState('');
  const [camError, setCamError] = useState('');
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState('');
  const handlingRef = useRef(false);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    let started = false;
    let scanner = null;
    handlingRef.current = false;
    setError('');
    setCamError('');
    setManual('');

    const stopScanner = async () => {
      if (!scanner || !started) return;
      started = false;
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        /* already stopped */
      }
    };

    const handleDecoded = async (text) => {
      if (handlingRef.current) return;
      handlingRef.current = true;
      setBusy(true);
      setError('');
      try {
        await onScanRef.current(text);
      } catch (err) {
        setError(err.message || 'Could not read that QR code.');
        // allow another scan after a short pause
        setTimeout(() => {
          handlingRef.current = false;
        }, 1500);
      } finally {
        setBusy(false);
      }
    };

    (async () => {
      try {
        scanner = new Html5Qrcode(REGION_ID);
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          handleDecoded,
          () => {}
        );
        started = true;
        if (cancelled) await stopScanner();
      } catch (err) {
        if (!cancelled) {
          setCamError(
            'Camera is not available. Allow camera access in your browser (the site needs HTTPS or localhost), or type the booking code below.'
          );
        }
      }
    })();

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      cancelled = true;
      window.removeEventListener('keydown', onKey);
      stopScanner();
    };
  }, [open, onClose]);

  const submitManual = async (e) => {
    e.preventDefault();
    const value = manual.trim();
    if (!value) return;
    setBusy(true);
    setError('');
    try {
      await onScanRef.current(value);
    } catch (err) {
      setError(err.message || 'Booking not found.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="qr-overlay" role="dialog" aria-modal="true" aria-label="Scan QR code" onClick={onClose}>
      <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal__head">
          <h3>Scan Booking QR</h3>
          <button type="button" className="qr-modal__close" onClick={onClose} aria-label="Close scanner">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="qr-modal__body">
          <div id={REGION_ID} className="qr-region" />
          {camError && <p className="qr-msg qr-msg--warn">{camError}</p>}
          {!camError && <p className="qr-hint">Point the camera at the customer&apos;s booking QR code.</p>}
          {busy && <p className="qr-hint">Checking booking...</p>}
          {error && <p className="qr-msg qr-msg--error">{error}</p>}

          <form className="qr-manual" onSubmit={submitManual}>
            <input
              type="text"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Or type booking code (e.g. BK1A2B3)"
              aria-label="Booking code"
            />
            <button type="submit" disabled={busy || !manual.trim()}>
              Find
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default QrScanner;