import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDistributeVerticalSpacing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 3H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1m-.5 16h-15c-.55 0-1 .45-1 1s.45 1 1 1h15c.55 0 1-.45 1-1s-.45-1-1-1M16 17c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3H8c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3z"
          />
    </Svg>
  );
}
