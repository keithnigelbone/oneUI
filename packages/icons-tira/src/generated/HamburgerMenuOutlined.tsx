import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const HamburgerMenuOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function HamburgerMenuOutlined(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path d="M19.999 17.4181C20.3304 17.4173 20.5998 17.6854 20.6006 18.0167C20.6013 18.348 20.3332 18.6174 20.002 18.6183L4.00195 18.6544C3.67065 18.6552 3.40125 18.3871 3.40039 18.0558C3.39964 17.7244 3.66766 17.455 3.99903 17.4542L19.999 17.4181ZM19.999 11.382C20.3304 11.3812 20.5998 11.6492 20.6006 11.9806C20.6013 12.3119 20.3332 12.5813 20.002 12.5822L4.00195 12.6183C3.67065 12.619 3.40125 12.3509 3.40039 12.0197C3.39964 11.6883 3.66766 11.4188 3.99903 11.4181L19.999 11.382ZM19.999 5.34583C20.3304 5.34508 20.5998 5.61309 20.6006 5.94446C20.6013 6.27576 20.3332 6.54516 20.002 6.54602L4.00195 6.58215C3.67065 6.5829 3.40125 6.3148 3.40039 5.98352C3.39964 5.65216 3.66766 5.38271 3.99903 5.38196L19.999 5.34583Z" fill="currentColor"/>
    </svg>
  );
});

HamburgerMenuOutlined.displayName = 'HamburgerMenuOutlined';
