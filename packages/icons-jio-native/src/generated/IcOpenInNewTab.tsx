import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOpenInNewTab(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 8a1 1 0 0 1-2 0V9.41l-4.29 4.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095L14.59 8H13a1 1 0 1 1 0-2h4a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
