import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCarDriver(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 12a8 8 0 0 0-8 8v1a1 1 0 1 0 2 0v-1a6 6 0 0 1 .31-1.9h.05a9.05 9.05 0 0 1 3.75 3.34A1 1 0 0 0 11 22h2a1 1 0 0 0 .89-.55 9 9 0 0 1 3.74-3.33h.06A6 6 0 0 1 18 20v1a1 1 0 0 0 2 0v-1a8 8 0 0 0-8-8m0 5a28 28 0 0 1-4.7-.72 6 6 0 0 1 9.4 0A28 28 0 0 1 12 17m0-6a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 12 11"
          />
    </Svg>
  );
}
