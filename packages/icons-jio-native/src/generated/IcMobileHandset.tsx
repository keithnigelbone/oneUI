import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMobileHandset(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 2H9C7.34 2 6 3.34 6 5v14c0 1.66 1.34 3 3 3h6c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3M9 20c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m3 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m3 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m0-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1m1-5c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1h6c.55 0 1 .45 1 1z"
          />
    </Svg>
  );
}
