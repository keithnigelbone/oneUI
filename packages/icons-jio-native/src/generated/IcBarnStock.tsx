import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBarnStock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 21h6v-2H9zm0-4h6v-2H9zm11.93-6.36L19.1 6a2 2 0 0 0-1.22-1.2L13 3.15a3.08 3.08 0 0 0-1.9 0L6.12 4.8A2 2 0 0 0 4.9 6l-1.83 4.64A1 1 0 0 0 4 12h1v7a2 2 0 0 0 2 2v-6.5A1.5 1.5 0 0 1 8.5 13h7a1.5 1.5 0 0 1 1.5 1.5V21a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 .93-1.36M13 8.5a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
