import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSos(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5.5 11h-1a.5.5 0 0 1 0-1h2a1 1 0 0 0 0-2h-2a2.5 2.5 0 1 0 0 5h1a.5.5 0 0 1 0 1h-2a1 1 0 0 0 0 2h2a2.5 2.5 0 0 0 0-5M12 8a3 3 0 0 0-3 3v2a3 3 0 0 0 6 0v-2a3 3 0 0 0-3-3m1 5a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zm6.5-2h-1a.5.5 0 0 1 0-1h2a1 1 0 1 0 0-2h-2a2.5 2.5 0 0 0 0 5h1a.5.5 0 0 1 0 1h-2a1 1 0 0 0 0 2h2a2.5 2.5 0 0 0 0-5"
          />
    </Svg>
  );
}
