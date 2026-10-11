import React, { useState } from 'react';

const W = 720;
const PAD = { top: 16, right: 18, bottom: 30, left: 34 };

function LineChart({ data, height = 240 }) {
  const [hover, setHover] = useState(null);
  const n = data.length;
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  const maxValue = Math.max(0, ...data.map((d) => d.value));
  const step = Math.max(1, Math.ceil(maxValue / 4));
  const top = step * 4;

  const x = (i) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v) => PAD.top + innerH - (v / top) * innerH;

  let line = '';
  data.forEach((d, i) => {
    if (i === 0) {
      line = `M ${x(i)} ${y(d.value)}`;
    } else {
      const mid = (x(i - 1) + x(i)) / 2;
      line += ` C ${mid} ${y(data[i - 1].value)}, ${mid} ${y(d.value)}, ${x(i)} ${y(d.value)}`;
    }
  });
  const baseline = PAD.top + innerH;
  const area = n > 0 ? `${line} L ${x(n - 1)} ${baseline} L ${x(0)} ${baseline} Z` : '';
  const labelEvery = Math.ceil(n / 8);
  const active = hover !== null ? data[hover] : null;

  return (
    <svg className="ad-linechart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label="Bookings over time">
      <defs>
        <linearGradient id="adLineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbb826" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#fbb826" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(step * i)} y2={y(step * i)} stroke="#eceef3" strokeDasharray={i === 0 ? '0' : '3 4'} />
          <text x={PAD.left - 10} y={y(step * i) + 4} textAnchor="end" className="ad-linechart__tick">
            {step * i}
          </text>
        </g>
      ))}

      {n > 0 && <path d={area} fill="url(#adLineFill)" />}
      {n > 0 && <path d={line} fill="none" stroke="#fbb826" strokeWidth="2.4" strokeLinecap="round" />}

      {data.map((d, i) => (
        <g key={d.label + i}>
          {i % labelEvery === 0 && (
            <text x={x(i)} y={height - 8} textAnchor="middle" className="ad-linechart__tick">
              {d.label}
            </text>
          )}
          <circle cx={x(i)} cy={y(d.value)} r={hover === i ? 5 : 3.2} fill="#fff" stroke="#fbb826" strokeWidth="2" />
          <rect
            x={x(i) - innerW / Math.max(n, 1) / 2}
            y={PAD.top}
            width={innerW / Math.max(n, 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        </g>
      ))}

      {active && (
        <g pointerEvents="none">
          <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={baseline} stroke="#fbb826" strokeOpacity="0.5" strokeDasharray="3 3" />
          <g transform={`translate(${Math.min(Math.max(x(hover), 60), W - 60)}, ${Math.max(y(active.value) - 44, 4)})`}>
            <rect x="-52" width="104" height="34" rx="8" fill="#101a2d" />
            <text y="14" textAnchor="middle" className="ad-linechart__tip-label">
              {active.label}
            </text>
            <text y="28" textAnchor="middle" className="ad-linechart__tip-value">
              {active.value} {active.value === 1 ? 'booking' : 'bookings'}
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}

export default LineChart;
