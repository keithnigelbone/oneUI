import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcChats(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.7 2h-5.4a6.28 6.28 0 0 0-5.09 2.6A8.3 8.3 0 0 1 8.3 4h5.4a8.3 8.3 0 0 1 8 6.18A6.2 6.2 0 0 0 22 8.3 6.3 6.3 0 0 0 15.7 2m-2 4H8.3a6.3 6.3 0 0 0-.9 12.53v1.87a1.35 1.35 0 0 0 2.16 1.08l3.84-2.88h.3a6.3 6.3 0 1 0 0-12.6M7 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
