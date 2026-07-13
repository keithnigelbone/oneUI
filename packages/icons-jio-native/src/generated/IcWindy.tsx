import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWindy(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 9h10c1.65 0 3-1.35 3-3s-1.35-3-3-3c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1m16 7H9c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1 .45 1 1s-.45 1-1 1-1 .45-1 1 .45 1 1 1c1.65 0 3-1.35 3-3s-1.35-3-3-3M3 12h16c1.65 0 3-1.35 3-3s-1.35-3-3-3c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1m16 2c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1h15c.55 0 1-.45 1-1"
          />
    </Svg>
  );
}
