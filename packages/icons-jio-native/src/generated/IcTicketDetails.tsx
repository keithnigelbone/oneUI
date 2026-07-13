import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTicketDetails(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M6 7h2a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2m6 10H6a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2m0-4H6a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2m5 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
