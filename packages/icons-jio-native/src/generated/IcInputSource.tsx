import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcInputSource(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 13h4.59l-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l2-2a.996.996 0 0 0 0-1.41l-2-2a.996.996 0 1 0-1.41 1.41l.29.29H3c-.55 0-1 .45-1 1s.45 1 1 1h2z"
          />
          <Path
            fill={fill}
            d="M19 4H6C4.35 4 3 5.35 3 7v2h2V7c0-.55.45-1 1-1h13c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-2H3v2c0 1.65 1.35 3 3 3h13c1.65 0 3-1.35 3-3V7c0-1.65-1.35-3-3-3"
          />
    </Svg>
  );
}
