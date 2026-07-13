import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcContacts(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3 6v12a3 3 0 0 0 3 3h1V3H6a3 3 0 0 0-3 3m15-3H9v18h9a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-3 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m2 8h-4a1 1 0 0 1-1-1 3 3 0 0 1 6 0 1 1 0 0 1-1 1"
          />
    </Svg>
  );
}
