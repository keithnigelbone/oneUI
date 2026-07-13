import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAirPurificationMode(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 10a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m2 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m0-6a1 1 0 1 0 0 2 1 1 0 0 0 0-2m12.71 5.29a1.004 1.004 0 1 0-1.42 1.42l.3.29H13V9h4.59l-.3.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.3.29H13V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3h4.59l-.3.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l2-2a1 1 0 0 0 0-1.42z"
          />
    </Svg>
  );
}
