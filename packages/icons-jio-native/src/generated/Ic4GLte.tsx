import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function Ic4GLte(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 5a2 2 0 0 1 3.34-1.47.502.502 0 0 1-.68.74A1 1 0 0 0 13 7a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0h-.5a.5.5 0 0 1 0-1h1a.5.5 0 0 1 .5.5V9a2 2 0 1 1-4 0zM6 9.34l1-3a.525.525 0 1 1 1 .32L7.19 9H8v-.5a.5.5 0 1 1 1 0V9h.5a.5.5 0 1 1 0 1H9v.5a.5.5 0 0 1-1 0V10H6.5a.52.52 0 0 1-.41-.21.48.48 0 0 1-.09-.45m2.5 8.16h-2A.5.5 0 0 1 6 17v-4a.5.5 0 0 1 1 0v3.5h1.5a.5.5 0 0 1 0 1m3.5-4h-1V17a.5.5 0 0 1-1 0v-3.5H9a.5.5 0 0 1 0-1h3a.5.5 0 0 1 0 1m3 1a.5.5 0 0 1 0 1h-1v1h1.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H14v1z"
          />
    </Svg>
  );
}
