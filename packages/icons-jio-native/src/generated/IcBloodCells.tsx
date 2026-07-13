import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBloodCells(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 9c2.21 0 4-1.34 4-3S9.21 3 7 3 3 4.34 3 6s1.79 3 4 3m11 8c-1.66 0-3 .9-3 2s1.34 2 3 2 3-.9 3-2-1.34-2-3-2M16.15 6.15c.58-.58.42-1.68-.35-2.45s-1.87-.93-2.45-.35-.42 1.68.35 2.45 1.87.93 2.45.35m-12.2 6.3C2.38 14.02 2.8 17 4.9 19.1s5.08 2.52 6.65.95 1.15-4.55-.95-6.65-5.08-2.52-6.65-.95M19.3 13.8c1.88-1.88 2.26-4.54.85-5.95s-4.07-1.03-5.95.85-2.26 4.54-.85 5.95 4.07 1.03 5.95-.85"
          />
    </Svg>
  );
}
