import React, { useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { useOutsideClick } from '../hooks/adminHooks.js';
import { ALL_TIME, endOfDay, formatDate, parseDate, presetRange, startOfDay } from '../utils/adminHelpers.js';

const PRESETS = [
  ['all', 'All time'],
  ['today', 'Today'],
  ['7d', 'Last 7 days'],
  ['30d', 'Last 30 days'],
  ['month', 'This month'],
];

const pad = (n) => String(n).padStart(2, '0');
const toInput = (d) => (d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : '');

// value: { from: Date|null, to: Date|null }
function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false), open);

  let label = 'All time';
  if (value.from && value.to) label = `${formatDate(value.from)}  -  ${formatDate(value.to)}`;
  else if (value.from) label = `From ${formatDate(value.from)}`;
  else if (value.to) label = `Until ${formatDate(value.to)}`;

  const setFrom = (text) => onChange({ ...value, from: text ? startOfDay(parseDate(text)) : null });
  const setTo = (text) => onChange({ ...value, to: text ? endOfDay(parseDate(text)) : null });

  return (
    <div className="ad-daterange" ref={ref}>
      <button type="button" className="ad-daterange__btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon name="calendar" size={16} />
        <span>{label}</span>
        <Icon name="chevronDown" size={16} />
      </button>

      {open && (
        <div className="ad-daterange__pop">
          <div className="ad-daterange__presets">
            {PRESETS.map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(key === 'all' ? ALL_TIME : presetRange(key));
                  setOpen(false);
                }}
              >
                {text}
              </button>
            ))}
          </div>
          <div className="ad-daterange__custom">
            <label>
              From
              <input type="date" value={toInput(value.from)} max={toInput(value.to)} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={toInput(value.to)} min={toInput(value.from)} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
