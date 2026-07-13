import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCardiologyOutput(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 4h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-2.41 0-4.43 1.72-4.9 4h2.08c.41-1.16 1.51-2 2.82-2m4.54 12-1.7 2.55c-.19.28-.5.45-.83.45h-.06a.98.98 0 0 1-.83-.55l-2.23-4.46-1.04 1.57c-.19.28-.5.45-.83.45h-2c-.55 0-1-.45-1-1s.45-1 1-1h1.46l1.7-2.55c.2-.3.52-.46.89-.44.36.02.67.23.83.55l2.23 4.46 1.04-1.57c.19-.28.5-.45.83-.45h2.93c-.49-3.95-3.85-7-7.93-7H6V3c0-.55-.45-1-1-1s-1 .45-1 1v11c0 4.42 3.58 8 8 8h5c1.66 0 3-1.34 3-3v-3z"
          />
    </Svg>
  );
}
