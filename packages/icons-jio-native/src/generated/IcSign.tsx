import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSign(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.3 3.7a12.88 12.88 0 0 0-8.45 0 13.1 13.1 0 0 0-8.16 16.62 1 1 0 0 0 .95.68q.18.026.36 0a1 1 0 0 0 .62-1.27 11.7 11.7 0 0 1-.48-2.13c.791.15 1.594.228 2.4.23a13.47 13.47 0 0 0 7.28-2.12 1 1 0 0 0 .39-1.15L14 11l4.06.68a1 1 0 0 0 1-.46A13.53 13.53 0 0 0 21 4.67a1 1 0 0 0-.7-.97"
          />
    </Svg>
  );
}
