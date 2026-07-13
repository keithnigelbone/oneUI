import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSteps(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.5 2C4.57 2 3 4.69 3 8a8.36 8.36 0 0 0 1.17 4.46 45 45 0 0 1 5-.68A8.9 8.9 0 0 0 10 8c0-3.31-1.57-6-3.5-6M5.33 14.29A4.5 4.5 0 0 0 5 16c0 1.93 1.12 4 2.5 4s2.5-2.07 2.5-4a4.4 4.4 0 0 0-.57-2.21c-1.58.12-2.97.31-4.1.5M17.5 4C15.57 4 14 6.69 14 10a8.9 8.9 0 0 0 .77 3.74c1.708.104 3.406.335 5.08.69A8.37 8.37 0 0 0 21 10c0-3.31-1.57-6-3.5-6m-2.9 11.74A4.36 4.36 0 0 0 14 18c0 1.93 1.12 4 2.5 4s2.5-2.07 2.5-4a4.4 4.4 0 0 0-.36-1.77 34 34 0 0 0-4.04-.49"
          />
    </Svg>
  );
}
