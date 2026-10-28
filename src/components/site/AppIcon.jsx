import React from 'react';

export default function AppIcon({ item, className = '' }) {
  return (
    <div className={`overflow-hidden border border-line bg-raised flex-shrink-0 ${className}`}>
      <img
        src={item.icon}
        alt=""
        loading="lazy"
        className={`w-full h-full object-cover ${item.iconScale}`}
        onError={(e) => {
          e.currentTarget.src = '/projects/default-app.svg';
        }}
      />
    </div>
  );
}
