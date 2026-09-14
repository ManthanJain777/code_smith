import React from 'react';

export interface AshokaEmblemProps {
  className?: string;
  size?: number;
  variant?: 'navy' | 'gold' | 'white' | 'color';
}

/**
 * AshokaEmblem — State Emblem of India (Lion Capital of Ashoka)
 * Uses the official Emblem_of_India.svg asset.
 */
export const AshokaEmblem: React.FC<AshokaEmblemProps> = ({
  className = '',
  size = 48,
  variant = 'color',
}) => {
  // Optional CSS filter for dark-mode / white backgrounds
  const filterStyle: React.CSSProperties =
    variant === 'white'
      ? { filter: 'brightness(0) invert(1)' }
      : variant === 'gold'
      ? { filter: 'sepia(100%) saturate(300%) brightness(85%) hue-rotate(5deg)' }
      : {};

  return (
    <img
      src="/Emblem_of_India.svg"
      alt="State Emblem of India"
      width={size}
      height={Math.round(size / 0.6275)}
      style={{
        width: `${size}px`,
        height: 'auto',
        maxHeight: `${Math.round(size * 1.6)}px`,
        display: 'inline-block',
        verticalAlign: 'middle',
        objectFit: 'contain',
        ...filterStyle,
      }}
      className={`select-none shrink-0 ${className}`}
      loading="eager"
    />
  );
};

export default AshokaEmblem;
