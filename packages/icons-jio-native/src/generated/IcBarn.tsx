import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBarn(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.93 10.64 19.1 6a2 2 0 0 0-1.22-1.2L13 3.15a3.08 3.08 0 0 0-1.9 0L6.12 4.8A2 2 0 0 0 4.9 6l-1.83 4.64A1 1 0 0 0 4 12h1v6a3 3 0 0 0 3 3h1v-7h6v7h1a3 3 0 0 0 3-3v-6h1a1 1 0 0 0 .93-1.36M13 8.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
