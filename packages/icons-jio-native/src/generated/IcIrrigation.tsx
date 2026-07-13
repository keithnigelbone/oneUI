import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIrrigation(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m5 2a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2M9 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2m9 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2M4 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m16 8h-6v-3h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v3H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2M6 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2m3 0h1v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V9h1a1 1 0 1 0 0-2H9a1 1 0 0 0 0 2M4 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
          />
    </Svg>
  );
}
