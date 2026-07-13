import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRoaming(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.69 7.31-4-4A1 1 0 0 0 15 4v16a1 1 0 0 0 2 0V6.45l2.27 2.28a1.003 1.003 0 1 0 1.42-1.42M8 11a.93.93 0 0 0 .45-.11 1 1 0 0 0 .44-1.34l-.73-1.47A3 3 0 0 0 6 3H4a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0V9h1q.18.015.36 0l.75 1.49A1 1 0 0 0 8 11M6 7H5V5h1a1 1 0 0 1 0 2m6-4a1 1 0 0 0-1 1v13.59l-2.29-2.3a1.005 1.005 0 0 0-1.714.71c0 .266.106.522.294.71l4 4A1 1 0 0 0 12 21a.84.84 0 0 0 .38-.08A1 1 0 0 0 13 20V4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
