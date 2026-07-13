import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVaccumCleaner(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 18h-1a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1M9 8.1V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9h2V7a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v1.1A5 5 0 0 0 3 13v6a1 1 0 0 0 1 1 1 1 0 1 0 2 0h4a1 1 0 0 0 2 0 1 1 0 0 0 1-1v-6a5 5 0 0 0-4-4.9m.5 9.4h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2m0-4h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
