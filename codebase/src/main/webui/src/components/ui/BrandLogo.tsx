import React, { useId } from 'react';
import { Link } from 'react-router-dom';

export interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  size = 'md',
  className = '',
  ...props
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `cifras-chord-pick-${uniqueId}`;

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const dimensionClass = typeof size === 'number' ? '' : sizeClasses[size] || sizeClasses.md;
  const inlineSize = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${dimensionClass} ${className}`.trim()}
      style={inlineSize}
      aria-hidden="true"
      data-testid="brand-icon"
      {...props}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="4"
          y1="2"
          x2="28"
          y2="30"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#aa3bff" />
          <stop offset="100%" stopColor="#8629cc" />
        </linearGradient>
      </defs>
      {/* Pick Silhouette */}
      <path
        d="M 6 7.5 C 6 4 10.5 2.5 16 2.5 C 21.5 2.5 26 4 26 7.5 C 26 13.5 21 23 17.5 28.2 C 16.8 29.2 15.2 29.2 14.5 28.2 C 11 23 6 13.5 6 7.5 Z"
        fill={`url(#${gradientId})`}
      />
      {/* Fretboard Strings Grid */}
      <path
        d="M 12 8.5 V 20.5 M 16 7.5 V 23.5 M 20 8.5 V 20.5"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Frets */}
      <path
        d="M 10 12 H 22 M 11.5 16.5 H 20.5"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Stylized 'C' Chord Arc */}
      <path
        d="M 21.5 10.5 C 19 8.5 13 8.5 10.5 13 C 8.5 16.8 11 22 17.5 22.5 C 19.8 22.7 21.5 21.5 22 20"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Chord Note Fingerings / Accents */}
      <circle cx="16" cy="12" r="1.5" fill="#ffffff" />
      <circle cx="20" cy="16.5" r="1.5" fill="#ffffff" />
    </svg>
  );
};

export interface BrandLogoProps {
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  asLink?: boolean;
  to?: string;
  onClick?: () => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  iconOnly = false,
  size = 'md',
  className = '',
  iconClassName = '',
  textClassName = '',
  asLink = false,
  to = '/dashboard',
  onClick,
  'aria-label': ariaLabel = 'CifrAS',
  'data-testid': testId = 'brand-logo',
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const gapSizes = {
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3.5',
  };

  const content = (
    <>
      <BrandIcon size={size} className={iconClassName} />
      {!iconOnly && (
        <span
          className={`font-bold tracking-tight text-[#8629cc] dark:text-[#aa3bff] select-none ${textSizes[size]} ${textClassName}`.trim()}
          data-testid="brand-logo-text"
        >
          CifrAS
        </span>
      )}
    </>
  );

  const containerClasses = `inline-flex items-center ${gapSizes[size]} ${className}`.trim();

  if (asLink) {
    return (
      <Link
        to={to}
        className={`${containerClasses} hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#8629cc]/50 rounded-lg`}
        aria-label={ariaLabel}
        data-testid={testId}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={containerClasses}
      aria-label={ariaLabel}
      data-testid={testId}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {content}
    </div>
  );
};

export default BrandLogo;
