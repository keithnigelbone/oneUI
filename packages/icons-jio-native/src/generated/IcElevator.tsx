import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcElevator(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 5v14a2 2 0 0 0 2 2h6V3H5a2 2 0 0 0-2 2m2.17 6.77 1.25-1.5a.79.79 0 0 1 1.16 0l1.25 1.5a.77.77 0 0 1 .1.8.75.75 0 0 1-.68.43h-2.5a.75.75 0 0 1-.68-.43.77.77 0 0 1 .1-.8M19 3h-6v18h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-.17 9.23-1.25 1.5a.758.758 0 0 1-1.16 0l-1.25-1.5a.77.77 0 0 1-.1-.8.75.75 0 0 1 .68-.43h2.5a.75.75 0 0 1 .68.43.77.77 0 0 1-.1.8"
          />
    </Svg>
  );
}
