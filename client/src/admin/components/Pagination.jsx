import React from 'react';
import Icon from './Icon.jsx';

function pageList(page, count) {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1);
  const wanted = [...new Set([1, count, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= count)
    .sort((a, b) => a - b);
  const out = [];
  wanted.forEach((n, i) => {
    if (i > 0 && n - wanted[i - 1] > 1) out.push(`gap-${n}`);
    out.push(n);
  });
  return out;
}

function Pagination({ pager, noun = 'items' }) {
  const { page, pageCount, total, start, end, setPage } = pager;

  return (
    <div className="ad-pagination">
      <span className="ad-pagination__info">
        {total === 0 ? `Showing 0 ${noun}` : `Showing ${start} - ${end} of ${total} ${noun}`}
      </span>
      <div className="ad-pagination__pages">
        <button type="button" className="ad-page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page">
          <Icon name="chevronLeft" size={15} />
        </button>
        {pageList(page, pageCount).map((n) =>
          typeof n === 'string' ? (
            <span key={n} className="ad-page-gap">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={`ad-page-btn ${n === page ? 'is-active' : ''}`}
              onClick={() => setPage(n)}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </button>
          )
        )}
        <button type="button" className="ad-page-btn" disabled={page >= pageCount} onClick={() => setPage(page + 1)} aria-label="Next page">
          <Icon name="chevronRight" size={15} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
