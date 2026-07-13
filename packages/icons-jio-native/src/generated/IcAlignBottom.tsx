import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcAlignBottom(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1m-10-2h4c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3h-4C8.34 3 7 4.34 7 6v8c0 1.66 1.34 3 3 3"
          />
    </Svg>
  );
}
