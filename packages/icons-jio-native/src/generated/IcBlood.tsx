import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBlood(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m17.7 10.4-4.85-7.92c-.36-.59-1.34-.59-1.71 0L6.29 10.4a8.76 8.76 0 0 0-1.3 4.6c0 3.86 3.14 7 7 7s7-3.14 7-7c0-1.62-.45-3.21-1.3-4.6zM16 16h-1v1c0 .55-.45 1-1 1s-1-.45-1-1v-1h-1c-.55 0-1-.45-1-1s.45-1 1-1h1v-1c0-.55.45-1 1-1s1 .45 1 1v1h1c.55 0 1 .45 1 1s-.45 1-1 1"
          />
    </Svg>
  );
}
