import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSleeping(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 16.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0M17.5 4a4 4 0 0 0-.48 0A5 5 0 0 0 8.4 5H8a4 4 0 0 0 0 8 4.2 4.2 0 0 0 1.33-.24 5 5 0 0 0 9.31.08A4.49 4.49 0 0 0 17.5 4M15 11.5h-3a1 1 0 0 1-.89-.55 1 1 0 0 1 .09-1L13 7.5h-1a1 1 0 1 1 0-2h3a1 1 0 0 1 .89.55 1 1 0 0 1-.09 1L14 9.5h1a1 1 0 1 1 0 2M9.5 19a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </Svg>
  );
}
