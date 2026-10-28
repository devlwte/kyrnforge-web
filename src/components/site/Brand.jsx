import React from 'react';
import { DEFAULT_APPEARANCE, MARKS } from '../../brand';

export function Mark({ icon, className }) {
  const mark = MARKS[icon] || MARKS[DEFAULT_APPEARANCE.icon];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {mark.paths.map((d) => <path key={d} d={d} fill="currentColor" fillRule="evenodd" />)}
    </svg>
  );
}

export function Tile({ icon, className, style }) {
  const mark = MARKS[icon] || MARKS[DEFAULT_APPEARANCE.icon];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className} style={style}>
      <rect width="64" height="64" rx="15" fill="var(--tile-bg, rgb(var(--accent)))" />
      <g fill="var(--tile-fg, rgb(var(--accent-fg)))" transform="translate(9 9) scale(0.71875)">
        {mark.paths.map((d) => <path key={d} d={d} fillRule="evenodd" />)}
      </g>
    </svg>
  );
}
