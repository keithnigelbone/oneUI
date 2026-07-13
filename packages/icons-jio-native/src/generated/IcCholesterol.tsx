import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCholesterol(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 4h-3.67c-1.07 0-2.14.35-3 1l-.53.4c-1.06.8-2.54.79-3.6 0L9.67 5c-.86-.64-1.93-1-3-1H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h3.67c1.07 0 2.14-.35 3-1l.53-.4a3.03 3.03 0 0 1 3.6 0l.53.4c.86.64 1.93 1 3 1H21c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1M5 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m3-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m8 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1"
          />
    </Svg>
  );
}
