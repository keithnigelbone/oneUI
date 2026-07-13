import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDrizzle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 16c-.5 0-1.5 1.67-1.5 2.5S6.17 20 7 20s1.5-.67 1.5-1.5S7.5 16 7 16m5 1.5c-.5 0-1.5 1.67-1.5 2.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-1-2.5-1.5-2.5m5-1.5c-.5 0-1.5 1.67-1.5 2.5S16.17 20 17 20s1.5-.67 1.5-1.5-1-2.5-1.5-2.5m2.44-7.62c.03-.21.06-.42.06-.63C19.5 5.13 17.37 3 14.75 3c-1.64 0-3.08.83-3.93 2.09A3.7 3.7 0 0 0 10 5a3.98 3.98 0 0 0-3.86 3.01C6.09 8.01 6.05 8 6 8c-1.66 0-3 1.34-3 3s1.34 3 3 3h12c1.66 0 3-1.34 3-3 0-1.13-.64-2.11-1.56-2.62"
          />
    </Svg>
  );
}
