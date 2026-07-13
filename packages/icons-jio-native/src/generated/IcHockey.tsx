import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHockey(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.5 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5m1.75-9.2a1.472 1.472 0 1 0-2.44-1.65L15.16 6.6l2.44 1.65zm-5.2 2.44-6.31 9.37a1 1 0 0 1-1.36.27 1 1 0 0 1-.27-1.37l.83-1.22a1.48 1.48 0 0 0-2.45-1.65l-.82 1.22a3.931 3.931 0 1 0 6.51 4.41l6.31-9.38z"
          />
    </Svg>
  );
}
