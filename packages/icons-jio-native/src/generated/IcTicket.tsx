import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTicket(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-7 12a1 1 0 0 1-2 0v-5l-.88.7a1 1 0 0 1-1.24-1.57l2.5-2A1 1 0 0 1 12 9zm5 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
