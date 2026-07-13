import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcKnownConditions(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.12 6.88A3 3 0 0 0 19 6h-6.59l-1.12-1.12A3 3 0 0 0 9.17 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V9a3 3 0 0 0-.88-2.12M18 14h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
