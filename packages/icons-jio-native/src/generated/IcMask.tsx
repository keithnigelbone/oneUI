import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMask(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 8h-1v-.31a2 2 0 0 0-1.22-1.84l-4-1.69a2 2 0 0 0-1.56 0l-4 1.69A2 2 0 0 0 6 7.69V8H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h1a4.44 4.44 0 0 0 4.35 4h3.2A4.44 4.44 0 0 0 18 16h1a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3M6 14H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1zm14-1a1 1 0 0 1-1 1h-1v-4h1a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
