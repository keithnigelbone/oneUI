import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoSize(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 20H5a1 1 0 0 1-1-1v-2a1 1 0 1 0-2 0v2a3 3 0 0 0 3 3h2a1 1 0 0 0 0-2m5-15a7 7 0 1 0 0 14 7 7 0 0 0 0-14m2.13 7.69-2.5 1.67a.86.86 0 0 1-.46.14.8.8 0 0 1-.4-.1.83.83 0 0 1-.44-.73v-3.34a.84.84 0 0 1 1.3-.69l2.5 1.67a.83.83 0 0 1 0 1.38M19 2h-2a1 1 0 1 0 0 2h2a1 1 0 0 1 1 1v2a1 1 0 0 0 2 0V5a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
