import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMenuCard(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 16h-4a1 1 0 0 1 0-2h4a1 1 0 0 1 0 2m1-6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1a2 2 0 1 1 0-4h.18a3 3 0 0 1 5.64 0H15a2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
