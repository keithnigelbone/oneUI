import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGaming(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M22 16.51A5.15 5.15 0 0 0 16.78 12H13v-1a1 1 0 0 1 1-1h1.88a3.08 3.08 0 0 0 3.06-2.4A3 3 0 0 0 16 4h-2a1 1 0 0 1-1-1 1.05 1.05 0 0 0-.29-.71A.999.999 0 0 0 11 3a3 3 0 0 0 3 3h2a1 1 0 1 1 0 2h-2a3 3 0 0 0-3 3v1H7.22A5.15 5.15 0 0 0 2 16.51a5 5 0 0 0 8.66 3.85 1 1 0 0 1 .77-.36h1.1a1 1 0 0 1 .77.36 5 5 0 0 0 8.7-3.85M9 18H8v1a1 1 0 1 1-2 0v-1H5a1 1 0 1 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2m8-4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m-2 4A1 1 0 1 1 15 16 1 1 0 0 1 15 18m2 2A1 1 0 1 1 17 18 1 1 0 0 1 17 20m2-2A1 1 0 1 1 19 16 1 1 0 0 1 19 18"
          />
    </Svg>
  );
}
