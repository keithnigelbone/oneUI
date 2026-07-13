import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJioInstitute(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 12h-3.1A5 5 0 0 0 13 8.1V7h2a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v4.1A5 5 0 0 0 7.1 12H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h6v-4a2 2 0 0 1 4 0v4h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1m-8 1a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
