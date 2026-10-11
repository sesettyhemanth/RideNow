import React from 'react';

// segments: [{ label, value, color }]
function DonutChart({ segments, centerValue, centerLabel }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visible = segments.filter((s) => s.value > 0).length;
  let accumulated = 0;

  return (
    <div className="ad-donut">
      <svg viewBox="0 0 36 36" role="img" aria-label="Distribution chart">
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f2f6" strokeWidth="5" />
        {total > 0 &&
          segments.map((s) => {
            const pct = (s.value / total) * 100;
            const gap = visible > 1 ? 0.8 : 0;
            const node = (
              <circle
                key={s.label}
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke={s.color}
                strokeWidth="5"
                strokeDasharray={`${Math.max(pct - gap, 0)} ${100 - Math.max(pct - gap, 0)}`}
                strokeDashoffset={25 - accumulated}
              />
            );
            accumulated += pct;
            return node;
          })}
      </svg>
      <div className="ad-donut__center">
        <strong>{centerValue}</strong>
        <span>{centerLabel}</span>
      </div>
    </div>
  );
}

export default DonutChart;
