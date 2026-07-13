import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBadminton(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5.05 9.15a3 3 0 0 0 .39 5.79 3 3 0 0 0 4.64 3.71 3 3 0 0 0 2.27 2.28q.32.07.65.07a3 3 0 0 0 2.93-2.35L17.62 11l-4.55-4.52zm15-5.33a3 3 0 0 0-4.24.1l-1.2 1.28 4.24 4.24 1.32-1.38a3 3 0 0 0-.11-4.24z"
          />
    </Svg>
  );
}
