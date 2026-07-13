import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNoSimCard(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.12 2.88A3 3 0 0 0 16 2h-5a2.86 2.86 0 0 0-1.32.29 3 3 0 0 0-1.06.84l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V5a3 3 0 0 0-.88-2.12m-3.41 13.41a1.002 1.002 0 0 1-.325 1.64 1 1 0 0 1-1.095-.22L12 16.41l-1.29 1.3a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.3-1.29-1.3-1.29a1.004 1.004 0 1 1 1.42-1.42l1.29 1.3 1.29-1.3a1.004 1.004 0 1 1 1.42 1.42L13.41 15z"
          />
    </Svg>
  );
}
