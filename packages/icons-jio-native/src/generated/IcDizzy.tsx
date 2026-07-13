import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDizzy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2m2 16c-2.76 0-5-2.24-5-5 0-1.65 1.35-3 3-3s3 1.35 3 3c0 .55-.45 1-1 1s-1-.45-1-1-.45-1-1-1-1 .45-1 1c0 1.65 1.35 3 3 3s3-1.35 3-3c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 .55-.45 1-1 1s-1-.45-1-1c0-3.86 3.14-7 7-7s7 3.14 7 7c0 2.76-2.24 5-5 5"
          />
    </Svg>
  );
}
