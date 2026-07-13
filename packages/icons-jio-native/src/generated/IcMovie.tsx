import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMovie(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M5.42 7h1a1 1 0 0 1 0 2h-1a1 1 0 0 1 0-2M6.5 17h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m6 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m0-8h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2m6 8h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2m0-8h-1a1 1 0 1 1 0-2h1a1 1 0 1 1 0 2"
          />
    </Svg>
  );
}
