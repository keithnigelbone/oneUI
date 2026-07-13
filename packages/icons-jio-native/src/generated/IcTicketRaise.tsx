import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTicketRaise(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 16H6v-1a1 1 0 1 0-2 0v1H3a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 0 0 0-2M19 4H5a3 3 0 0 0-3 3v6a5 5 0 0 1 7 7h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-2 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
